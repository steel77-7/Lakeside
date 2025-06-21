import express from 'express'
import 'dotenv/config'
import http from 'http';
import { MediaSoupService } from "./logic/MediaSoupService"
import { WebSocket, WebSocketServer } from "ws"
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './logic/RoomManager';

const app = express();
const PORT = process.env.PORT;
const mediasoup = new MediaSoupService()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
const roomManager = new RoomManager();

app.get("/health-check", (_req, res) => {
    res.status(200).json({ "message": "Server is healthy" })
})

// WebSocket
const send = (ws: WebSocket, type: string, data: any) => {
    ws.send(JSON.stringify({ type, data }))
}

(async () => {
    await mediasoup.start()

    wss.on("connection", (ws: WebSocket) => {
        const clientId = uuidv4()
        let roomId: string | null = null;

        wss.on('message', async (message) => {
            const { type, data } = JSON.parse(message.toString());

            try {
                switch (type) {
                    case "createRoom":
                        roomManager.createRoom(data.roomId)
                        send(ws, "roomCreated", {})
                        break;

                    case "joinRoom":
                        roomId = data.roomId;
                        if (roomId) {
                            roomManager.joinRoom(roomId, clientId)
                            send(ws, "joinedRoom", {
                                rtpCapabilities: mediasoup.getRtpCapabilities()
                            })
                        }
                        break;

                    case "createTransport": {
                        const { transport, params } = await mediasoup.createWebRtcTransport();
                        roomManager.addTransporter(roomId!, clientId, transport);
                        send(ws, "transportCreated", params);
                        break;
                    }

                    case 'connectTransport': {
                        const peer = roomManager.getPeer(roomId!, clientId);
                        const transport = peer?.transports.find(t => t.id === data.transportId)
                        const producer = await transport!.produce({
                            kind: data.kind,
                            rtpParameters: data.rtpParameters
                        })
                        roomManager.addProducer(roomId!, clientId, producer)
                        send(ws, 'produced', { id: producer.id })
                        break;
                    }

                    default:
                        send(ws, "error", { message: "Unknown type" });
                }
            } catch (error: any) {
                send(ws, "error", { message: error.message });
            }
        })
        ws.on('close', () => {
            if (roomId) roomManager.removePeer(roomId, clientId)
        })
    })

    app.listen(PORT, () => {
        console.log(`Serving on PORT ${PORT}`)
    })
})()
