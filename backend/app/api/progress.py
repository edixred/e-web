from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.models.schemas import ProgressResponse, ProgressUpdate, UserStats
from app.services.story_service import StoryService
from typing import Optional

router = APIRouter(prefix="/user", tags=["User"])


async def get_current_user_id(authorization: str = Header(None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token"
        )

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    return payload.get("user_id")


@router.get("/progress", response_model=list[ProgressResponse])
async def get_progress(
    db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user_id)
):
    story_service = StoryService(db)
    return await story_service.get_user_progress(user_id)


@router.put("/progress/{story_id}", response_model=ProgressResponse)
async def update_progress(
    story_id: int,
    progress_data: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        story_service = StoryService(db)
        return await story_service.update_progress(
            user_id=user_id,
            story_id=story_id,
            current_position=progress_data.current_position,
            completed=progress_data.completed,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress",
        )


@router.get("/stats", response_model=UserStats)
async def get_stats(
    db: AsyncSession = Depends(get_db), user_id: int = Depends(get_current_user_id)
):
    from sqlalchemy import select, func
    from app.models.models import ReadingProgress, User, DifficultyLevel

    result = await db.execute(
        select(
            func.count(ReadingProgress.id), func.sum(ReadingProgress.current_position)
        ).where(ReadingProgress.user_id == user_id, ReadingProgress.completed == True)
    )
    row = result.one()

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    return UserStats(
        total_stories_read=row[0] or 0,
        total_time_minutes=int((row[1] or 0) / 150),
        current_streak=1,
        level=user.level if user else DifficultyLevel.A1,
    )
