from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "HZR Reply is running!"

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json(silent=True)

    print("Received:", data)

    return jsonify({
        "success": True
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
                           )
