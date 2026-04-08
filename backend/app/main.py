import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

app = FastAPI(
    title="CLEAN-THE-SEA API",
    description="海洋プラスチック汚染データの可視化・収集・クレジット取引MVP",
    version="0.1.0",
)

# CORS設定: フロントエンド（Next.js）からのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(OperationalError)
async def db_connection_error_handler(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={"detail": "データベースに接続できません。しばらくしてから再試行してください。"},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    custom_errors = []
    for error in errors:
        loc = error.get("loc", ())
        if "density" in loc and error.get("type") == "enum":
            custom_errors.append({
                "loc": list(loc),
                "msg": "密度レベルはlow, medium, highのいずれかを指定してください。",
                "type": error.get("type", "value_error"),
            })
        else:
            custom_errors.append({
                "loc": list(loc),
                "msg": error.get("msg", ""),
                "type": error.get("type", "value_error"),
            })
    return JSONResponse(
        status_code=422,
        content={"detail": custom_errors},
    )


if USE_MOCK:
    from .routers.mock_router import router as mock_router
    app.include_router(mock_router)
    print("🔶 モックデータモードで起動中（USE_MOCK=true）")
else:
    from .routers.contributors import router as contributors_router
    from .routers.hotspots import router as hotspots_router
    from .routers.projects import router as projects_router
    from .routers.submissions import router as submissions_router
    app.include_router(contributors_router)
    app.include_router(hotspots_router)
    app.include_router(projects_router)
    app.include_router(submissions_router)


@app.get("/")
async def root():
    return {"message": "CLEAN-THE-SEA API is running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
