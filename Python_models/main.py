import os
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# CORS: allow the Vercel frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dasboard-saas-fhmx.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Simple health endpoint used by Render's health checks
@app.get("/health")
def health():
    return {"ok": True}


@app.get("/ping")
def ping():
    """Simple health-check used by browser/monitoring to confirm service is reachable."""
    return {"status": "ok"}


class InferenceRequest(BaseModel):
    text: str
    # add more fields if your model expects them


def verify_api_key(x_api_key: Optional[str]):
    expected = os.environ.get("PYTHON_SERVICE_KEY")
    if not expected:
        # no key configured — reject by default for safety
        raise HTTPException(status_code=500, detail="Server not configured with PYTHON_SERVICE_KEY")
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/api/infer")
async def infer(req: InferenceRequest, x_api_key: Optional[str] = Header(None)):
    # Basic auth check — require PYTHON_SERVICE_KEY to be set in env
    verify_api_key(x_api_key)

    # TODO: replace the following placeholder with real model loading/inference
    # Example: model = app.state.model, run model(req.text)
    result = {
        "input": req.text,
        "summary": "(placeholder) model inference not yet implemented",
    }
    return {"success": True, "result": result}


if __name__ == "__main__":
    # Local dev entrypoint. When Render runs with gunicorn it will import `main:app`.
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
