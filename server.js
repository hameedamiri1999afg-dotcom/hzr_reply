const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const WASENDER_API_KEY = process.env.WASENDER_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.get("/", (req, res) => {
    res.send("HZR Reply is running.");
});

app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
        // بررسی Webhook Secret
        const signature = req.headers["x-webhook-signature"];

        if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
            return res.status(401).json({
                success: false,
                error: "Invalid webhook signature"
            });
        }

        const payload = req.body;

        console.log("Event:", payload.event);

        // فقط پیام‌های دریافتی
        if (
            payload.event !== "messages.received" &&
            payload.event !== "messages-personal.received"
        ) {
            return res.status(200).json({
                received: true,
                ignored: true
            });
        }

        const message = payload.data?.messages;

        if (!message) {
            return res.status(200).json({
                received: true
            });
        }

        // پیام‌هایی که خودمان فرستاده‌ایم را نادیده بگیر
        if (message.key?.fromMe === true) {
            return res.status(200).json({
                received: true,
                ignored: true
            });
        }

        const text = (message.messageBody || "").trim();
        const sender = message.key?.remoteJid;

        console.log("From:", sender);
        console.log("Message:", text);

        if (!sender || !text) {
            return res.status(200).json({
                received: true
            });
        }

        // اگر کسی گفت سلام
        if (text.includes("سلام")) {

            if (!WASENDER_API_KEY) {
                console.error("WASENDER_API_KEY is missing.");

                return res.status(500).json({
                    success: false,
                    error: "API key is not configured"
                });
            }

            const response = await fetch(
                "https://www.wasenderapi.com/api/send-message",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${WASENDER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        to: sender,
                        text: "ع سلام"
                    })
                }
            );

            const result = await response.json();

            console.log("Wasender response:", result);
        }

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error("Webhook error:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`HZR Reply running on port ${PORT}`);
});
