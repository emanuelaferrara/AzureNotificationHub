import { ImapFlow } from "imapflow";

export class MailService {
  client: ImapFlow;
  sender: string;
  notify: (messages: string[]) => void;

  constructor(
    email: string,
    password: string,
    sender: string,
    notify: (messages: string[]) => void,
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
          });
          for (let msg of newMessages) {
            // if (msg.envelope?.sender?.at(0)?.address === this.sender)
            this.notify([msg.envelope?.subject ?? "subject empty"]);
          }
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
    });

    return (
      newMessages
        // .filter((msg) => msg.envelope?.sender?.at(0)?.address === this.sender)
        .map((msg) => msg.envelope?.subject ?? "subject empty")
    );
  }
}
