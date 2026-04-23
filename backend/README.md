## AquaDetect Backend (Flask)

This folder contains the backend API described in `bug-free-winner/AquaDetect_PRD.md`.

### Quickstart (local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
python -m flask --app app run --port 5000
```

### Notes

- **Auth**: By default, endpoints expect a Firebase ID token. For local development you can bypass auth by setting `AUTH_MODE=dev`.
- **Model**: If you provide an ONNX model path via `ONNX_MODEL_PATH`, `/api/v1/detect` will run inference. If not, the endpoint returns a clear `503` error telling you what’s missing.

