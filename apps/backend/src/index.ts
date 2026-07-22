import { ImapFlow } from "imapflow";
import { Configs, SENDER_TO_NOTIFY } from "./config.ts";

watchAndFetch().catch(console.error);

async function watchAndFetch() {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: Configs.EMAIL,
      pass: Configs.PASSWORD,
    },
    logger: false
  });

  await client.connect();

  const lock = await client.getMailboxLock("INBOX");
  try {
    if (!client.mailbox) {
      return;
    }

    let lastCount = client.mailbox.exists;
    console.log(`Watching INBOX (${lastCount} messages)...`);

    client.on("exists", async (data) => {
      // We already hold the lock, so we can fetch directly
      if (data.count > lastCount) {
        let newMessages = await client.fetchAll(`${lastCount + 1}:*`, {
          envelope: true,
        });
        for (let msg of newMessages) {

            if(msg.envelope?.sender?.at(0)?.address === SENDER_TO_NOTIFY) {
                console.log(`New RELEVANT: ${msg.envelope?.subject}`);
            }
          console.log(`New: ${msg.envelope?.subject}`);
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
  await client.logout();
}

// import { poll } from "./mail_client.ts";
// poll();
