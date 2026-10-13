import uuid
from pathlib import Path

from fastapi import UploadFile


UPLOAD_DIR = Path("uploads/pets")

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def save_pet_photo(file: UploadFile) -> str:
    extension = ALLOWED_CONTENT_TYPES.get(file.content_type)

    if extension is None:
        raise ValueError("Invalid image format")

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / filename

    with file_path.open("wb") as buffer:
        buffer.write(file.file.read())

    return filename