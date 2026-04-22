## AquaGuard / FishAI (Hackathon)

This repository contains:

- **`bug-free-winner/`**: Product docs (PRD, workflow, architecture).
- **`Freshwater Fish Disease Aquaculture in south asia/`**: Dataset images + CSV.
- **`backend/`**: Python Flask backend implementing the PRD API.

### Backend (local)

```bash
cd backend
cp .env.example .env

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python3 -m flask --app app run --port 5000
```

### API quick check

- `GET /health`
- `POST /api/diagnose` (FishAI PRD contract; base64 image)
- `POST /api/v1/detect` (older contract; imageUrl)

