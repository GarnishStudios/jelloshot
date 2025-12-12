from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from app.core.oauth import oauth
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
from app.schemas.user import User as UserSchema

router = APIRouter()


@router.get("/login/google")
async def login_google(request: Request):
    # Redirect to Google for authentication
    redirect_uri = request.url_for("auth_google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {str(e)}")

    user_info = token.get("userinfo")
    if not user_info:
        # Fallback if userinfo not in token (depends on scope/provider)
        user_info = await oauth.google.userinfo(token=token)

    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in OAuth data")

    # Find or create user
    user = (
        db.query(User)
        .filter(and_(User.email == email, User.provider == "google"))
        .first()
    )
    if not user:
        user = User(
            email=email,
            full_name=user_info.get("name"),
            picture=user_info.get("picture"),
            provider="google",
            provider_id=user_info.get("sub"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update info if needed
        if user.picture != user_info.get("picture"):
            user.picture = user_info.get("picture")
            db.commit()

    # Set session
    request.session["user_id"] = str(user.id)

    # Redirect to clients page
    return RedirectResponse(url=f"{settings.FRONTEND_URL}")


@router.post("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}


@router.get("/me", response_model=UserSchema)
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        request.session.clear()
        raise HTTPException(status_code=401, detail="User not found")

    return user
