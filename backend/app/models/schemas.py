from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DifficultyLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class StoryCategory(str, Enum):
    ADVENTURE = "Adventure"
    SCIFI = "Science Fiction"
    ROMANCE = "Romance"
    MYSTERY = "Mystery"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    level: DifficultyLevel = DifficultyLevel.A1


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    level: DifficultyLevel
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class StoryGenerateRequest(BaseModel):
    level: DifficultyLevel
    category: StoryCategory
    word_count: int = 800


class StoryResponse(BaseModel):
    id: int
    title_en: str
    title_es: str
    content_en: str
    content_es: str
    level: DifficultyLevel
    category: StoryCategory
    audio_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StoryListResponse(BaseModel):
    stories: List[StoryResponse]
    total: int
    page: int
    page_size: int


class AudioResponse(BaseModel):
    audio_url: str
    timestamps: str


class ProgressUpdate(BaseModel):
    current_position: int
    completed: bool = False


class ProgressResponse(BaseModel):
    id: int
    story_id: int
    current_position: int
    completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    total_stories_read: int
    total_time_minutes: int
    current_streak: int
    level: DifficultyLevel
