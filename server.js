const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\nScan this QR code with WhatsApp:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("HZR Reply connected successfully.");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("Connection closed. Reconnecting...");
                startBot();
            } else {
                console.log("WhatsApp session logged out.");
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const message = messages[0];

        if (!message.message) return;
        if (message.key.fromMe) return;

        const jid = message.key.remoteJid;

        if (!jid || jid === "status@broadcast") return;

        const text =
            message.message.conversation ||
            message.message.extendedTextMessage?.text ||
            "";

        console.log(`Message from ${jid}: ${text}`);

        if (text.trim().includes("سلام")) {
            await sock.sendMessage(jid, {
                text: "ع سلام"
            });

            console.log(`Reply sent to ${jid}`);
        }
    });
}

startBot().catch((error) => {
    console.error("Fatal error:", error);
});
