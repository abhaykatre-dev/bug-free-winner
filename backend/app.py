import os
from datetime import datetime, timezone

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from services.logging import configure_logging
from services.settings import Settings
from services.auth import auth_bp
from routes.detect import detect_bp
from routes.explain import explain_bp
from routes.economic import economic_bp
from routes.timeline import timeline_bp
from routes.risk import risk_bp
from routes.outbreak import outbreak_bp
from routes.similarity import similarity_bp
from routes.translate import translate_bp
from routes.telegram import telegram_bp
from routes.api_prd import api_bp, limiter


def create_app() -> Flask:
    load_dotenv()
    settings = Settings.from_env()

    configure_logging(settings.log_level)

    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    cors_origins = settings.cors_origins
    if cors_origins:
        CORS(app, origins=cors_origins)
    else:
        CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/api/v1")
    app.register_blueprint(detect_bp, url_prefix="/api/v1")
    app.register_blueprint(explain_bp, url_prefix="/api/v1")
    app.register_blueprint(economic_bp, url_prefix="/api/v1")
    app.register_blueprint(timeline_bp, url_prefix="/api/v1")
    app.register_blueprint(risk_bp, url_prefix="/api/v1")
    app.register_blueprint(outbreak_bp, url_prefix="/api/v1")
    app.register_blueprint(similarity_bp, url_prefix="/api/v1")
    app.register_blueprint(translate_bp, url_prefix="/api/v1")
    app.register_blueprint(telegram_bp, url_prefix="/api/v1")

    # FishAI_PRD-compatible API surface
    app.register_blueprint(api_bp, url_prefix="/api")
    limiter.init_app(app)

    @app.get("/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "time": datetime.now(timezone.utc).isoformat(),
                "authMode": settings.auth_mode,
            }
        )

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)

