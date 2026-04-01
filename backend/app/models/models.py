from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    Float,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DifficultyLevel(str, enum.Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"


class StoryCategory(str, enum.Enum):
    ADVENTURE = "Adventure"
    SCIFI = "Science Fiction"
    ROMANCE = "Romance"
    MYSTERY = "Mystery"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    level = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.A1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    progress = relationship("ReadingProgress", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="light")
    font_size = Column(Integer, default=18)
    auto_scroll = Column(Boolean, default=True)
    playback_speed = Column(Float, default=1.0)

    user = relationship("User", back_populates="settings")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title_en = Column(String(255), nullable=False)
    title_es = Column(String(255), nullable=False)
    content_en = Column(Text, nullable=False)
    content_es = Column(Text, nullable=False)
    level = Column(SQLEnum(DifficultyLevel), nullable=False)
    category = Column(SQLEnum(StoryCategory), nullable=False)
    audio_url = Column(String(500), nullable=True)
    audio_timestamps = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    progress = relationship("ReadingProgress", back_populates="story")


class ReadingProgress(Base):
    __tablename__ = "reading_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=False)
    current_position = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="progress")
    story = relationship("Story", back_populates="progress")
