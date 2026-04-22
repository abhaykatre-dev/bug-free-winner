"""
SMS alert service via Fast2SMS API.
Returns (success: bool, error_message: str | None)
"""
from __future__ import annotations
import os
import logging
import requests

log = logging.getLogger(__name__)


def send_sms_alert(phone_number: str, message: str) -> tuple[bool, str | None]:
    """
    Send SMS via Fast2SMS bulkV2 API.
    NOTE: Requires ≥ ₹100 recharge on Fast2SMS account before API access is active.
    Returns (success, error_message).
    """
    api_key = os.environ.get("FAST2SMS_API_KEY", "").strip()
    if not api_key:
        return False, "FAST2SMS_API_KEY not set in backend .env"

    # Sanitize: Indian mobile — 10 digits, no +91 prefix
    digits = "".join(filter(str.isdigit, phone_number))
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) != 10:
        return False, f"Invalid Indian mobile number ({len(digits)} digits supplied, need 10)"

    try:
        resp = requests.get(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": api_key, "cache-control": "no-cache"},
            params={
                "route": "q",
                "message": message[:450],
                "language": "english",
                "flash": "0",
                "numbers": digits,
            },
            timeout=15,
        )
        data = resp.json()
        log.info("Fast2SMS response [%s]: %s", resp.status_code, data)

        if data.get("return") is True:
            log.info("SMS sent successfully to %s", digits)
            return True, None

        # Surface exact API error to caller
        raw_msg = data.get("message", "")
        if isinstance(raw_msg, list):
            raw_msg = " ".join(str(m) for m in raw_msg)
        error_text = str(raw_msg).strip() or f"API error (status_code={data.get('status_code')})"

        # Friendly hint for the most common case
        if "transaction" in error_text.lower() or data.get("status_code") == 999:
            error_text = "Fast2SMS account needs ≥ ₹100 recharge. Recharge at fast2sms.com to enable API."

        log.warning("Fast2SMS failed: %s", error_text)
        return False, error_text

    except requests.Timeout:
        err = "Fast2SMS request timed out (15s)"
        log.error(err)
        return False, err
    except Exception as e:
        err = f"Fast2SMS network error: {e}"
        log.error(err)
        return False, err
