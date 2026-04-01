from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")
        auth_service = AuthService(db)
        user = await auth_service.register(user_data)
        logger.info(f"User registered successfully: {user.email}")
        return UserResponse.model_validate(user)
    except ValueError as e:
        logger.error(f"Validation error during registration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        logger.info(f"Login attempt for email: {credentials.email}")
        auth_service = AuthService(db)
        token = await auth_service.login(credentials)
        logger.info(f"User logged in successfully: {credentials.email}")
        return token
    except ValueError as e:
        logger.error(f"Validation error during login: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        logger.exception(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.post("/logout")
async def logout(user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        auth_service = AuthService(db)
        await auth_service.logout(user_id)
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout failed"
        )
