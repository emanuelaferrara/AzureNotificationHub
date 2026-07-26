import { WebSocketServer, type Server } from "ws";

export class NotificationService {
  wss: Server | undefined;
  fullDump: (notify: (notifications: string[]) => void) => void;

  constructor(
    fullDump: (notify: (notifications: string[]) => void) => void,
  ) {
    this.fullDump = fullDump;
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
    });
  }

  notify = (notifications: string[]): void => {
    if (!this.wss) {
      throw new Error("wss is not initialized");
    }

    const clients = this.wss.clients.values().toArray();

    if (clients.length === 0) {
      throw new Error("no client available");
    }
    
    clients.forEach((client) => {
      notifications.forEach((message) => {
        client.send(JSON.stringify({
          title: message,
          body: "body",
          notify: true
        }), (error) => {
          console.log("notify",{message,error})
        });
      });
    });
  };
}