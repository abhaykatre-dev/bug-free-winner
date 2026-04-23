<p align="center">
  <img src="frontend/public/logo.png" width="250" alt="AquaDetect AI">
</p>

AquaDetect is an intelligent aquaculture platform designed to help fish farmers instantly detect diseases, get AI-driven treatment protocols, and receive real-time outbreak alerts via Telegram and SMS.
## 🚀 Features

- **Instant AI Diagnosis:** Upload a photo of a fish to get a highly accurate diagnosis using MobileNetV2.
- **Economic Loss Estimation:** Get estimates on potential revenue loss vs. treatment costs.
- **Offline First:** Fully functional offline (PWA), caches diagnoses, and syncs when connection returns.
- **Instant Alerts:** Get critical outbreak and pond status alerts straight to your Telegram via our integrated Bot.
- **Multilingual Support:** Auto-translates reports into Hindi, Bengali, and more.

---

## 🛠 Tech Stack

### Frontend (React + Vite)
- **Framework:** React.js (TypeScript) + Vite
- **Styling:** CSS Modules, Lucide Icons
- **Deployment:** Vercel (Ready)

### Backend (Python Flask)
- **Framework:** Flask (REST APIs, Webhooks)
- **Machine Learning:** PyTorch (MobileNetV2)
- **Database:** SQLite
- **Deployment:** Railway / Render (Ready)

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/abhaykatre-dev/bug-free-winner.git
cd bug-free-winner
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # (On Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# Create .env file from .env.example and fill API keys
copy .env.example .env

# Run the backend
python app.py
```
*Backend runs on `http://127.0.0.1:5001`*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Create .env file (copy .env.example) and add your keys
copy .env.example .env

# Start the dev server
npm run dev
```
*Frontend runs on `http://localhost:5173`*


---

## 🤝 Contributing

We welcome contributions from the open-source community! 

### How to Contribute
1. **Fork** the repository.
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit: `git commit -m "feat: add some feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. Open a **Pull Request**.

### Guidelines
- Ensure your code follows the existing style conventions.
- Update documentation and README if you introduce new features.
- Test your features locally in both the frontend and backend environments before submitting a PR.

---
*Built with ❤️ for aquaculture sustainability.*
