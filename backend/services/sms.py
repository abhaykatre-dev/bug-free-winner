import os
import requests

def send_sms_alert(phone_number: str, message: str) -> bool:
    """Sends an SMS via Fast2SMS API."""
    api_key = os.environ.get("FAST2SMS_API_KEY")
    if not api_key:
        print("FAST2SMS_API_KEY not set")
        return False

    url = "https://www.fast2sms.com/dev/bulkV2"
    
    # Fast2SMS requires variables for DLT routing, but we can try quick message route
    querystring = {
        "authorization": api_key,
        "message": message,
        "language": "english",
        "route": "q",
        "numbers": phone_number
    }
    
    headers = {
        'cache-control': "no-cache"
    }

    try:
        response = requests.request("GET", url, headers=headers, params=querystring)
        data = response.json()
        print(f"SMS Response: {data}")
        return data.get("return", False)
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False
