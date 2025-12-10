from fastapi.openapi.utils import get_openapi
from main import app

openapi_schema = get_openapi(
    title=app.title,
    version=app.version,
    routes=app.routes,
)

import json

with open("generated/openapi.json", "w") as f:
    json.dump(openapi_schema, f, indent=2)

print("openapi.json generated!")
