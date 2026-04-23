import os
import requests
from dotenv import load_dotenv

def main():
    # Load env variables from backend/.env
    load_dotenv()
    
    TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    if not TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN not found in environment variables.")
        return
        
    url = f"https://api.telegram.org/bot{TOKEN}/setMyCommands"
    
    commands = [
        {"command": "start", "description": "Start the bot & get your Chat ID"},
        {"command": "myid", "description": "Get your Chat ID instantly"},
        {"command": "report", "description": "Get your latest diagnosis report"},
        {"command": "pondstatus", "description": "View pond risk summary"},
        {"command": "alert", "description": "Check outbreak alerts in your area"},
        {"command": "help", "description": "Show available commands"}
    ]
    
    print("Setting Telegram bot commands...")
    response = requests.post(url, json={"commands": commands})
    
    if response.status_code == 200 and response.json().get("ok"):
        print("Success! Bot commands have been updated. You will now see a Menu button in Telegram with these commands.")
    else:
        print(f"Failed to set commands. Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    main()
