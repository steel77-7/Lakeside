import * as mediasoup from "mediasoup";
import { Worker, Router, WebRtcTransport } from "mediasoup/node/lib/types"

export class MediaSoupService {
    private worker!: Worker
    public router!: Router

    async start() {
        this.worker = await mediasoup.createWorker({ rtcMinPort: 2000, rtcMaxPort: 2020 })
        this.router = await this.worker.createRouter({
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 48000,
                }
            ]
        })
        console.log("Mediasoup Started")
    }

    async createWebRtcTransport(): Promise<{
        transport: WebRtcTransport,
        params: any;
    }> {
        const transport = await this.router.createWebRtcTransport({
            listenIps: [{ ip: "127.0.0.1", announcedIp: undefined }],
            enableTcp: true,
            enableUdp: true,
            enableSctp: true
        })
        return {
            transport,
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        }
    }
    getRtpCapabilities() {
        return this.router.rtpCapabilities;
    }
}