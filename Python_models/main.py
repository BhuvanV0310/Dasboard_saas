import os
import logging
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

logger = logging.getLogger("python_models")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Python Models Service")

# Allowed origins (restrict to known frontends). Add more origins via ALLOWED_ORIGINS env if needed.
# NOTE: keep this list tight in production to avoid CORS risks.
VERCEL_ORIGIN = "https://dasboard-saas-fhmx-j8gwq8h9h-bhuvans-projects-6eee2ee8.vercel.app"
# Common Vercel preview / deployed origin (also allow short hostname seen in production)
VERCEL_ORIGIN_SHORT = "https://dasboard-saas-fhmx.vercel.app"
# Frontend deployed on Render
RENDER_ORIGIN = "https://dasboard-saas-1.onrender.com"
LOCAL_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

extra = os.environ.get("ALLOWED_ORIGINS", "")
extra_list: List[str] = [o.strip() for o in extra.split(",") if o.strip()] if extra else []

ALLOW_ORIGINS = [VERCEL_ORIGIN, VERCEL_ORIGIN_SHORT, RENDER_ORIGIN] + LOCAL_ORIGINS + extra_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Python models service starting up")
    logger.info("Allowed CORS origins: %s", ALLOW_ORIGINS)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/ping")
def ping():
    """Simple health-check used by browser/monitoring to confirm service is reachable."""
    return {"status": "ok"}


class InferenceRequest(BaseModel):
    text: str


def verify_api_key(x_api_key: Optional[str]):
    expected = os.environ.get("PYTHON_SERVICE_KEY")
    if not expected:
        # In production we expect a key; during local development you can set PYTHON_SERVICE_KEY to bypass.
        raise HTTPException(status_code=500, detail="Server not configured with PYTHON_SERVICE_KEY")
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/api/infer")
async def infer(req: InferenceRequest, x_api_key: Optional[str] = Header(None)):
    # Basic auth check — require PYTHON_SERVICE_KEY to be set in env
    verify_api_key(x_api_key)

    # Placeholder inference logic; replace with actual model code.
    result = {"input": req.text, "summary": "(placeholder) model inference not yet implemented"}
    return {"success": True, "result": result}


if __name__ == "__main__":
    # Local dev entrypoint. When Render runs with gunicorn it will import `main:app` from root main.py.
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    # Run the app object directly to avoid issues with module import paths when running locally.
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
