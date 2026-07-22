import Imap from "imap";
import { simpleParser } from "mailparser";
import { Configs, SENDER_TO_NOTIFY } from "./config.ts";

// FIXME
// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let isReady = false;

const imapConfig: Imap.Config = {
  user: Configs.EMAIL,
  password: Configs.PASSWORD,
  host: "imap.gmail.com",
  tls: true,
  port: 993,
};

const imap = new Imap(imapConfig);

imap.once("ready", () => {
  console.log("IMAP client ready");
  console.log("Starting pool service");

  isReady = true;
});

imap.connect();

export function poll(): void {
  if (!isReady) {
    setTimeout(poll, 10000);
    return;
  }

  imap.openBox("INBOX", false, (error, mailbox) => {
    console.log("INBOX opened");
    console.log({ error, mailbox });

    imap.search(
      [
        "UNSEEN",
        ["SINCE", new Date()],
        // ["FROM", SENDER_TO_NOTIFY]
      ],
      (err, results) => {
        console.log({ err, results });

        const fetchObject = imap.fetch(results, { bodies: "" });

        fetchObject.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, (err, parsed) => {
              console.log(`message: ${parsed.subject}`);
            });
          });

          msg.once("attributes", (attrs) => {
            const { uid } = attrs;
            imap.addFlags(uid, ["\\Seen"], (error) => {
              if (error) {
                console.log({ error });
                return;
              }
              console.log(`${uid} Marked as read!`);
            });
          });
        });

        fetchObject.once("error", (ex) => {
          return Promise.reject(ex);
        });

        fetchObject.once("end", () => {
          console.log("Done fetching all messages!");
          imap.end();
        });
      },
    );
  });

  setTimeout(poll, 60000);
}
