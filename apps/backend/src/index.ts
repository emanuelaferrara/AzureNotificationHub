import { Configs, SENDER_TO_NOTIFY } from "./config.ts";
import { MailService } from "./services/MailService.ts";
import { NotificationService } from "./services/NotificationService.ts";

let mailService: MailService;
let notificationService: NotificationService;


function notify(messages: string[]) {
  notificationService?.notify(messages);
}

function fullDump(notify: (messages: string[]) => void) {
  console.log("full dump")
  mailService.fetchAll().then(notify);
}

notificationService = new NotificationService(fullDump)
mailService = new MailService(Configs.EMAIL, Configs.PASSWORD, SENDER_TO_NOTIFY, notify);


notificationService.init();
mailService.listen().catch(console.error);
