import os
import time
import requests
import sys
from dotenv import load_dotenv

# Load env variables
load_dotenv()
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    print("Error: TELEGRAM_BOT_TOKEN not set in .env")
    sys.exit(1)

# Delete the webhook so polling works
print("Deleting webhook...")
requests.post(f"https://api.telegram.org/bot{TOKEN}/deleteWebhook")
print("Webhook deleted! Starting polling...\n")

LAST_UPDATE_ID = None

def get_updates():
    global LAST_UPDATE_ID
    url = f"https://api.telegram.org/bot{TOKEN}/getUpdates"
    params = {"timeout": 30}
    if LAST_UPDATE_ID:
        params["offset"] = LAST_UPDATE_ID + 1

    try:
        resp = requests.get(url, params=params, timeout=35)
        data = resp.json()
        if data.get("ok"):
            return data.get("result", [])
    except Exception as e:
        print(f"Error fetching updates: {e}")
    return []

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": text})
        print(f"Replied to {chat_id}")
    except Exception as e:
        print(f"Failed to send message: {e}")

print("Bot is listening for messages. Press Ctrl+C to stop.\n")

while True:
    updates = get_updates()
    for update in updates:
        LAST_UPDATE_ID = update["update_id"]
        message = update.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        text = str(message.get("text", "")).strip().lower()

        if not chat_id or not text:
            continue

        print(f"Received from {chat_id}: {text}")

        if text.startswith("/start"):
            send_message(
                chat_id, 
                "🐟 Welcome to AquaDetect AI!\n\n"
                f"Your Chat ID is: {chat_id}\n\n"
                "Copy this Chat ID and paste it in the AquaDetect app to receive alerts.\n\n"
                "Available commands:\n"
                "/report — Get your latest diagnosis report\n"
                "/pondstatus — View pond risk summary\n"
                "/alert — Check outbreak alerts in your area\n"
                "/help — Show this message\n\n"
                "Upload a fish photo via the AquaDetect app to run a diagnosis."
            )
        elif text.startswith("/myid") or text.startswith("/chatid"):
            send_message(
                chat_id,
                f"Your Chat ID is: {chat_id}\n\n"
                "Copy this Chat ID and paste it in the AquaDetect app to receive alerts."
            )
        else:
            send_message(
                chat_id, 
                "Unknown command or not fully connected to DB in simple mode. Use /myid to get your Chat ID."
            )
    time.sleep(1)
