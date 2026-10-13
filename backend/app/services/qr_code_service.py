from io import BytesIO

import qrcode


def generate_pet_qr_code(url: str) -> BytesIO:
    qr = qrcode.make(url)

    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer