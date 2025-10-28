"""Root entrypoint wrapper so `uvicorn main:app` works when the real app
lives in `Python_models/main.py`.

Render (and other hosts) often run `uvicorn main:app`. This file dynamically
loads the Python_models.main module and exposes `app` at the package root.
"""
import importlib.util
import os

HERE = os.path.dirname(__file__)
MODULE_PATH = os.path.join(HERE, "Python_models", "main.py")

if not os.path.exists(MODULE_PATH):
    raise RuntimeError(f"Expected module at {MODULE_PATH} not found")

spec = importlib.util.spec_from_file_location("python_models.main", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Expose the FastAPI app object here so `uvicorn main:app` works.
app = getattr(module, "app")
