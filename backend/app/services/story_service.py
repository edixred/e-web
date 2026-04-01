from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.models import Story, ReadingProgress, DifficultyLevel, StoryCategory
from app.models.schemas import (
    StoryResponse,
    StoryListResponse,
    ProgressResponse,
    AudioResponse,
)
from app.core.config import settings
import redis.asyncio as redis
import json
import httpx


class StoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.redis_client = None

    async def get_redis(self):
        if not self.redis_client:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
            )
        return self.redis_client

    async def list_stories(
        self,
        level: DifficultyLevel = None,
        category: StoryCategory = None,
        page: int = 1,
        page_size: int = 10,
    ) -> StoryListResponse:
        query = select(Story)

        if level:
            query = query.where(Story.level == level)
        if category:
            query = query.where(Story.category == category)

        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)

        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        stories = result.scalars().all()

        return StoryListResponse(
            stories=[StoryResponse.model_validate(s) for s in stories],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_story(self, story_id: int) -> StoryResponse:
        redis = await self.get_redis()
        cached = await redis.get(f"story:{story_id}")

        if cached:
            return StoryResponse(**json.loads(cached))

        result = await self.db.execute(select(Story).where(Story.id == story_id))
        story = result.scalar_one_or_none()

        if not story:
            raise ValueError("Story not found")

        story_response = StoryResponse.model_validate(story)
        await redis.setex(
            f"story:{story_id}", settings.CACHE_TTL, story_response.model_dump_json()
        )

        return story_response

    async def generate_story(
        self, level: DifficultyLevel, category: StoryCategory, word_count: int
    ) -> StoryResponse:
        if not settings.OPENAI_API_KEY:
            return await self._generate_sample_story(level, category)

        prompt = self._build_generation_prompt(level, category, word_count)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a language learning content generator. Generate short stories with parallel translations.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                    },
                    timeout=60.0,
                )

                if response.status_code != 200:
                    raise ValueError(f"Failed to generate story: {response.text}")

                content = response.json()["choices"][0]["message"]["content"]

            story_data = self._parse_ai_response(content)

            story = Story(
                title_en=story_data["title_en"],
                title_es=story_data["title_es"],
                content_en=story_data["content_en"],
                content_es=story_data["content_es"],
                level=level,
                category=category,
            )

            self.db.add(story)
            await self.db.commit()
            await self.db.refresh(story)

            return StoryResponse.model_validate(story)
        except Exception as e:
            return await self._generate_sample_story(level, category)

    async def _generate_sample_story(
        self, level: DifficultyLevel, category: StoryCategory
    ) -> StoryResponse:
        sample_stories = {
            "A1": {
                "title_en": "The Lost Key",
                "title_es": "La Llave Perdida",
                "content_en": "Maria found an old key in her grandmother's attic. It was rusty and mysterious. She wondered what door it could open. Her grandmother smiled and said, That key opens a box full of family memories. Maria carefully opened the box. Inside, she found old photographs, letters, and a beautiful necklace. She learned that family history is precious.",
                "content_es": "María encontró una llave vieja en el desván de su abuela. Estaba oxidada y misteriosa. Se preguntaba qué puerta podría abrir. Su abuela sonrió y dijo: Esa llave abre una caja llena de recuerdos familiares. María abrió la caja con cuidado. Dentro, encontró fotografías viejas, cartas y un collar hermoso. Aprendió que la historia familiar es preciosa.",
            },
            "A2": {
                "title_en": "The Space Adventure",
                "title_es": "La Aventura Espacial",
                "content_en": "Tom was a young scientist who dreamed of traveling to Mars. He worked very hard every day to build a spaceship. Finally, the day came when his rocket was ready. He felt nervous but excited. As the rocket lifted off, Tom looked back at Earth and smiled. He was going to explore the red planet!",
                "content_es": "Tom era un científico joven que soñaba con viajar a Marte. Trabajaba muy duro todos los días para construir una nave espacial. Finalmente, llegó el día cuando su cohete estuvo listo. Se sentía nervioso pero emocionado. Mientras el cohete despegaba, Tom miró hacia atrás a la Tierra y sonrió. ¡Iba a explorar el planeta rojo!",
            },
            "B1": {
                "title_en": "The Mystery of the Old House",
                "title_es": "El Misterio de la Casa Vieja",
                "content_en": "Everyone in the town was afraid of the old house on the hill. No one had entered it for fifty years. One stormy night, a brave journalist named Sarah decided to investigate. She found mysterious letters hidden in the walls. The letters revealed a family secret that had been buried for generations. Sometimes, the truth is more surprising than fiction.",
                "content_es": "Todos en el pueblo le tenían miedo a la casa vieja en la colina. Nadie había entrado en ella durante cincuenta años. Una noche tormentosa, una valiente periodista llamada Sarah decidió investigar. Encontró cartas misteriosas ocultas en las paredes. Las cartas revelaron un secreto familiar que había estado enterrado durante generaciones. A veces, la verdad es más sorprendente que la ficción.",
            },
            "B2": {
                "title_en": "Love in the City",
                "title_es": "Amor en la Ciudad",
                "content_en": "Emma worked in a busy coffee shop in New York City. Every morning, a handsome architect came in for his coffee. They started talking about books and architecture. Over time, they realized they were falling in love. The city was noisy, but their love story was quiet and beautiful. Sometimes, the best relationships start with a simple cup of coffee.",
                "content_es": "Emma trabajaba en una cafetería concurrida en la ciudad de Nueva York. Todas las mañanas, un apuesto arquitecto entraba por su café. Empezaron a hablar sobre libros y arquitectura. Con el tiempo, se dieron cuenta de que se estaban enamorando. La ciudad era ruidosa, pero su historia de amor era tranquila y hermosa. A veces, las mejores relaciones comienzan con una simple taza de café.",
            },
            "C1": {
                "title_en": "The Future of Humanity",
                "title_es": "El Futuro de la Humanidad",
                "content_en": "In the year 2150, humanity had colonized several planets. Dr. Martinez was leading a groundbreaking project to communicate with alien civilizations. Her team had developed a universal translator that could decode any language. When the first message arrived from a distant galaxy, Dr. Martinez realized that everything humanity believed about the universe was about to change. The discovery would reshape our understanding of existence itself.",
                "content_es": "En el año 2150, la humanidad había colonizado varios planetas. La Dra. Martinez lideraba un proyecto innovador para comunicarse con civilizaciones alienígenas. Su equipo había desarrollado un traductor universal que podía decodificar cualquier idioma. Cuando llegó el primer mensaje de una galaxia distante, la Dra. Martinez se dio cuenta de que todo lo que la humanidad creía sobre el universo estaba a punto de cambiar. El descubrimiento reformularía nuestra comprensión de la existencia misma.",
            },
        }

        story_data = sample_stories.get(level.value, sample_stories["B1"])

        story = Story(
            title_en=story_data["title_en"],
            title_es=story_data["title_es"],
            content_en=story_data["content_en"],
            content_es=story_data["content_es"],
            level=level,
            category=category,
        )

        self.db.add(story)
        await self.db.commit()
        await self.db.refresh(story)

        return StoryResponse.model_validate(story)

    def _build_generation_prompt(
        self, level: DifficultyLevel, category: StoryCategory, word_count: int
    ) -> str:
        level_descriptions = {
            "A1": "very simple English with basic vocabulary, short sentences, present tense",
            "A2": "simple English with common vocabulary, basic sentence structures",
            "B1": "intermediate English with some complex sentences, varied vocabulary",
            "B2": "upper-intermediate English with sophisticated vocabulary and structures",
            "C1": "advanced English with complex sentences, idiomatic expressions",
        }

        return f"""Generate a {word_count}-word {category.value} story in English at {level} level ({level_descriptions[level.value]}).
        
Format the output as JSON with these exact keys:
- title_en: Story title in English
- title_es: Story title in Spanish  
- content_en: The complete story in English
- content_es: The complete translation in Spanish

The Spanish translation should be accurate and natural. Format each paragraph as a separate line in the content.
"""

    def _parse_ai_response(self, content: str) -> dict:
        import re

        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if not json_match:
            raise ValueError("Invalid AI response format")
        return json.loads(json_match.group())

    async def get_audio(self, story_id: int) -> AudioResponse:
        redis = await self.get_redis()
        cached = await redis.get(f"audio:{story_id}")

        if cached:
            data = json.loads(cached)
            return AudioResponse(**data)

        result = await self.db.execute(select(Story).where(Story.id == story_id))
        story = result.scalar_one_or_none()

        if not story:
            raise ValueError("Story not found")

        timestamps = self._generate_timestamps(story.content_en)

        audio_response = AudioResponse(
            audio_url=f"/api/v1/stories/{story_id}/audio",
            timestamps=json.dumps(timestamps),
        )

        await redis.setex(
            f"audio:{story_id}", settings.CACHE_TTL, audio_response.model_dump_json()
        )

        return audio_response

    def _generate_timestamps(self, content: str) -> list:
        sentences = content.split(". ")
        current_time = 0.0
        timestamps = []
        avg_words_per_sentence = 12
        avg_words_per_minute = 150

        for i, sentence in enumerate(sentences):
            word_count = len(sentence.split())
            duration = (word_count / avg_words_per_minute) * 60

            timestamps.append(
                {
                    "sentence_index": i,
                    "start": round(current_time, 2),
                    "end": round(current_time + duration, 2),
                    "text": sentence.strip(),
                }
            )

            current_time += duration

        return timestamps

    async def update_progress(
        self,
        user_id: int,
        story_id: int,
        current_position: int,
        completed: bool = False,
    ) -> ProgressResponse:
        from datetime import datetime

        result = await self.db.execute(
            select(ReadingProgress).where(
                ReadingProgress.user_id == user_id, ReadingProgress.story_id == story_id
            )
        )
        progress = result.scalar_one_or_none()

        if progress:
            progress.current_position = current_position
            progress.completed = completed
            if completed:
                progress.completed_at = datetime.utcnow()
        else:
            progress = ReadingProgress(
                user_id=user_id,
                story_id=story_id,
                current_position=current_position,
                completed=completed,
                completed_at=datetime.utcnow() if completed else None,
            )
            self.db.add(progress)

        await self.db.commit()
        await self.db.refresh(progress)

        return ProgressResponse.model_validate(progress)

    async def get_user_progress(self, user_id: int) -> list[ProgressResponse]:
        result = await self.db.execute(
            select(ReadingProgress).where(ReadingProgress.user_id == user_id)
        )
        progress = result.scalars().all()
        return [ProgressResponse.model_validate(p) for p in progress]
