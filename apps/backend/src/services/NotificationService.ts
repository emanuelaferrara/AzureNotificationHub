import { WebSocketServer, type Server } from "ws";
import type { NotificationPayload } from "./NotificationParser.ts";

export class NotificationService {
  wss: Server | undefined;
  fullDump: (notify: (notifications: NotificationPayload[]) => void) => void;
  onRead: (id: string) => void;

  constructor(fullDump: (notify: (notifications: NotificationPayload[]) => void) => void, onRead: (id: string) => void) {
    this.fullDump = fullDump;
    this.onRead = onRead;
  }

  init() {
    if (this.wss) {
      throw new Error("wss already initialized");
    }

    this.wss = new WebSocketServer({ port: 8080 });
    console.log("WebSocket server is running on ws://localhost:8080");

    this.wss.on("connection", (ws, message) => {
      console.log("New client connected");

      // Send the full notification list
      this.fullDump(this.notify);

      ws.on("close", (code, reason) => {
        console.log("Client disconnected");
        console.log({ code, reason });
      });

    ws.on('message', (rawData) => {
      //@ts-expect-error
      const data = JSON.parse(rawData) as {id: string;};

      this.onRead(data.id);
    })
    });

  }

  notify = (notifications: NotificationPayload[]): void => {
    if (!this.wss) {
      throw new Error("wss is not initialized");
    }

    const clients = this.wss.clients.values().toArray();

    if (clients.length === 0) {
      throw new Error("no client available");
    }

    clients.forEach((client) => {
      notifications.forEach((notification) => {
        client.send(JSON.stringify(notification), (error) => {
          //console.log("notify", { notification, error });
        });
      });
    });
  };
}
