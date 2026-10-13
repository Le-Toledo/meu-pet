from fastapi import FastAPI
from app.api.pets import router as pets_router
from app.api.users import router as users_router
from app.api.pet_weight import router as pet_weight_router
from app.api.vaccines import router as vaccines_router
from app.api.medications import router as medications_router
from app.api.reminders import router as reminders_router
from app.api.public_pets import router as public_pets_router
from app.api.vet_visits import router as vet_visits_router
from app.api import medication_doses


app = FastAPI(
    title="MeuPet API",
    description="API para gerenciamento de pets e seus cuidados.",
    version="1.0.0",
)

app.include_router(pets_router)
app.include_router(users_router)
app.include_router(pet_weight_router)
app.include_router(vaccines_router)
app.include_router(medications_router)
app.include_router(reminders_router)
app.include_router(public_pets_router)
app.include_router(vet_visits_router)
app.include_router(medication_doses.router)


@app.get("/")
def home():
    return {
        "app": "MeuPet",
        "status": "online",
        "message": "API MeuPet funcionando!"
    }
