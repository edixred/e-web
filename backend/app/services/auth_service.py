from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, UserSettings
from app.models.schemas import UserCreate, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from datetime import timedelta
import redis.asyncio as redis
import json
import logging

logger = logging.getLogger(__name__)


class AuthService:
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

    async def register(self, user_data: UserCreate) -> User:
        logger.info(f"Checking if email exists: {user_data.email}")
        result = await self.db.execute(
            select(User).where(User.email == user_data.email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            logger.warning(f"Email already registered: {user_data.email}")
            raise ValueError("Email already registered")

        logger.info(f"Creating new user: {user_data.email}")
        password_hash = get_password_hash(user_data.password)
        logger.info(f"Password hashed successfully")

        user = User(
            email=user_data.email,
            password_hash=password_hash,
            name=user_data.name,
            level=user_data.level,
        )
        self.db.add(user)
        await self.db.flush()

        user_settings = UserSettings(user_id=user.id)
        self.db.add(user_settings)

        await self.db.commit()
        await self.db.refresh(user)
        logger.info(f"User created successfully with ID: {user.id}")
        return user

    async def login(self, credentials: UserLogin) -> Token:
        logger.info(f"Looking up user: {credentials.email}")
        result = await self.db.execute(
            select(User).where(User.email == credentials.email)
        )
        user = result.scalar_one_or_none()

        if not user:
            logger.warning(f"User not found: {credentials.email}")
            raise ValueError("Invalid email or password")

        logger.info(f"Verifying password for: {credentials.email}")
        password_valid = verify_password(credentials.password, user.password_hash)
        logger.info(f"Password verification result: {password_valid}")

        if not password_valid:
            logger.warning(f"Invalid password for user: {credentials.email}")
            raise ValueError("Invalid email or password")

        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        redis = await self.get_redis()
        await redis.setex(
            f"session:{user.id}",
            settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            json.dumps({"user_id": user.id, "email": user.email}),
        )

        logger.info(f"User logged in successfully: {credentials.email}")
        return Token(access_token=access_token)

    async def logout(self, user_id: int):
        redis = await self.get_redis()
        await redis.delete(f"session:{user_id}")

    async def get_current_user(self, email: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
