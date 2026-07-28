import { ImapFlow, type FetchMessageObject } from "imapflow";
import { parseNotificationEmail, type NotificationPayload } from "./NotificationParser.ts";

export function isMessageRead(flags?: Iterable<string> | null): boolean {
  return Array.from(flags ?? []).some((flag) => flag === "\\Seen" || flag === "\\SEEN");
}

async function toPayload(msg: FetchMessageObject): Promise<NotificationPayload> {
  const read = isMessageRead(msg.flags);
  if (msg.source) {
    try {
      return await parseNotificationEmail(msg.source, read);
    } catch (error) {
      console.error("failed to parse notification email, falling back to subject only", error);
    }
  }

  const title = msg.envelope?.subject ?? "subject empty";
  return {
    id: msg.envelope?.messageId ?? String(msg.uid),
    title,
    body: title,
    category: "unknown",
    createdAt: (msg.envelope?.date ?? new Date()).toISOString(),
    read,
    metadata: { action: "unknown" },
  };
}

export class MailService {
  client: ImapFlow;
  sender: string;
  notify: (notifications: NotificationPayload[]) => void;

  constructor(
    email: string,
    password: string,
    sender: string,
    notify: (notifications: NotificationPayload[]) => void,
  ) {
    this.client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
      logger: false,
    });

    this.sender = sender;

    this.notify = notify;
  }

  async listen() {
    if (!this.client) {
      throw new Error("client already initialized");
    }

    await this.client.connect();

    const lock = await this.client.getMailboxLock("INBOX");
    try {
      if (!this.client.mailbox) {
        return;
      }

      let lastCount = this.client.mailbox.exists;
      console.log(`Watching INBOX (${lastCount} messages)...`);

      this.client.on("exists", async (data) => {
        // We already hold the lock, so we can fetch directly
        if (data.count > lastCount) {
          let newMessages = await this.client.fetchAll(`${lastCount + 1}:*`, {
            envelope: true,
            source: true,
            flags: true,
          });
          const notifications = await Promise.all(
            // if (msg.envelope?.sender?.at(0)?.address === this.sender)
            newMessages.map((msg) => toPayload(msg)),
          );
          this.notify(notifications);
          lastCount = data.count;
        }
      });

      // Wait until interrupted
      console.log("WAITING FOR MESSAGES");
      await new Promise((resolve) => process.on("SIGINT", resolve));
    } finally {
      console.log("KILLED");
      lock.release();
    }

    console.log("LOGGIN OUT");
    await this.client.logout();
  }

  async markSeen(uid: string) {
    await this.client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
  }

  async fetchAll(): Promise<NotificationPayload[]> {
    const newMessages = await this.client.fetchAll("1:*", {
      envelope: true,
      source: true,
      flags: true,
    });

    return Promise.all(
      // .filter((msg) => msg.envelope?.sender?.at(0)?.address === this.sender)
      newMessages.map((msg) => toPayload(msg)),
    );
  }
}
