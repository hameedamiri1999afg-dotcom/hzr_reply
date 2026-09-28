import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

WASENDER_API_KEY = os.getenv("WASENDER_API_KEY")

@app.route("/")
def home():
    return "HZR Reply is running!"


@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json(silent=True) or {}

    print("Received:", data)

    # فقط پیام‌های دریافتی را پردازش کن
    if data.get("event") != "messages.received":
        return jsonify({"success": True})

    message_data = data.get("data", {}).get("messages", {})

    key = message_data.get("key", {})
    message_text = message_data.get("messageBody", "")
    sender = key.get("remoteJid")

    if not sender:
        return jsonify({"success": True})

    # حذف فاصله‌های اضافی
    message_text = message_text.strip()

    # سلام -> ع سلام
    if message_text == "سلام":
        response = requests.post(
            "https://www.wasenderapi.com/api/send-message",
            headers={
                "Authorization": f"Bearer {WASENDER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "to": sender,
                "text": "ع سلام"
            },
            timeout=15
        )

        print("Reply status:", response.status_code)
        print("Reply:", response.text)

    return jsonify({"success": True})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
