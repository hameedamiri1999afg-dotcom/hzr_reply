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
        console.log("========== WEBHOOK RECEIVED ==========");
        console.log("Event:", JSON.stringify(req.body?.event));
        console.log("Body:", JSON.stringify(req.body));

        const signature = req.headers["x-webhook-signature"];

        if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
            console.log("Invalid webhook signature.");
            return res.status(401).json({
                success: false,
                error: "Invalid webhook signature"
            });
        }

        const event = req.body?.event;

        // Current WasenderAPI payload
        if (
            event?.type === "messages" &&
            event?.event === "post"
        ) {
            const messages = Array.isArray(req.body?.messages)
                ? req.body.messages
                : [];

            for (const message of messages) {
                if (!message) continue;

                if (message.from_me === true) {
                    continue;
                }

                const text = String(
                    message.text?.body || ""
                ).trim();

                const sender =
                    message.from ||
                    message.chat_id ||
                    message.phone;

                console.log("Sender:", sender);
                console.log("Message:", text);

                if (!sender || !text) {
                    continue;
                }

                if (text.includes("سلام")) {
                    if (!WASENDER_API_KEY) {
                        console.error("WASENDER_API_KEY is missing.");
                        continue;
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

                    const result = await response.text();

                    console.log("Send status:", response.status);
                    console.log("Send response:", result);
                }
            }
        }

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`HZR Reply running on port ${PORT}`);
});
