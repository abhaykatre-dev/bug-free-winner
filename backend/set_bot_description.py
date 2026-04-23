import os
import requests
from dotenv import load_dotenv

def main():
    load_dotenv()
    TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN not found.")
        return

    # 1. "What can this bot do?" - Shows up before hitting Start
    description_url = f"https://api.telegram.org/bot{TOKEN}/setMyDescription"
    description_text = (
        "🐟 Welcome to the AquaDetect AI Bot! 🐟\n\n"
        "This bot connects directly with the AquaDetect platform to keep you informed about your aquaculture operations.\n\n"
        "What can I do for you?\n"
        "✅ Send you instant alerts when disease outbreaks are detected in your ponds.\n"
        "✅ Provide detailed AI diagnosis reports straight to your phone.\n"
        "✅ Give you your unique Chat ID so you can securely link your account on the AquaDetect website.\n\n"
        "Just press 'Start' to begin!"
    )
    
    # 2. Short description - Shows on the bot's profile under its name
    short_desc_url = f"https://api.telegram.org/bot{TOKEN}/setMyShortDescription"
    short_desc_text = "Official AquaDetect AI Bot for instant fish disease alerts and diagnosis reports."

    print("Setting bot description...")
    resp1 = requests.post(description_url, json={"description": description_text})
    if resp1.status_code == 200 and resp1.json().get("ok"):
        print("Success: Main description set successfully!")
    else:
        print("Failed to set description:", resp1.text)

    print("Setting short description...")
    resp2 = requests.post(short_desc_url, json={"short_description": short_desc_text})
    if resp2.status_code == 200 and resp2.json().get("ok"):
        print("Success: Short description set successfully!")
    else:
        print("Failed to set short description:", resp2.text)

if __name__ == "__main__":
    main()
