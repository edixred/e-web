from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import (
    StoryResponse,
    StoryListResponse,
    StoryGenerateRequest,
    AudioResponse,
    ProgressResponse,
    ProgressUpdate,
)
from app.services.story_service import StoryService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stories", tags=["Stories"])


@router.get("", response_model=StoryListResponse)
async def list_stories(
    level: str = Query(None),
    category: str = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    from app.models.schemas import DifficultyLevel, StoryCategory

    level_enum = None
    category_enum = None

    try:
        if level:
            level_enum = DifficultyLevel(level)
        if category:
            category_enum = StoryCategory(category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid level or category"
        )

    story_service = StoryService(db)
    return await story_service.list_stories(level_enum, category_enum, page, page_size)


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: int, db: AsyncSession = Depends(get_db)):
    try:
        story_service = StoryService(db)
        return await story_service.get_story(story_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.exception(f"Error getting story {story_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get story",
        )


@router.post(
    "/generate", response_model=StoryResponse, status_code=status.HTTP_201_CREATED
)
async def generate_story(
    request: StoryGenerateRequest, db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(
            f"Generating story: level={request.level}, category={request.category}, words={request.word_count}"
        )
        story_service = StoryService(db)
        story = await story_service.generate_story(
            request.level, request.category, request.word_count
        )
        logger.info(f"Story generated successfully: {story.id}")
        return story
    except Exception as e:
        logger.exception(f"Error generating story: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate story: {str(e)}",
        )


@router.get("/{story_id}/audio", response_model=AudioResponse)
async def get_story_audio(story_id: int, db: AsyncSession = Depends(get_db)):
    try:
        story_service = StoryService(db)
        return await story_service.get_audio(story_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.exception(f"Error getting audio for story {story_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get audio",
        )
