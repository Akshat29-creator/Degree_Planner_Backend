# Routers package
from app.routers.courses import router as courses_router
from app.routers.planner import router as planner_router
from app.routers.ai import router as ai_router
from app.routers.auth import router as auth_router
from app.routers.revision import router as revision_router
from app.routers.history import router as history_router
from app.routers.manual_entry import router as manual_entry_router

__all__ = [
    "courses_router", 
    "planner_router", 
    "ai_router", 
    "auth_router", 
    "revision_router",
    "history_router",
    "manual_entry_router"
]
