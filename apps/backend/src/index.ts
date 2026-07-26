import { Configs, SENDER_TO_NOTIFY } from "./config.ts";
import { MailService } from "./services/MailService.ts";
import type { NotificationPayload } from "./services/NotificationParser.ts";
import { NotificationService } from "./services/NotificationService.ts";

let mailService: MailService;
let notificationService: NotificationService;


function notify(notifications: NotificationPayload[]) {
  notificationService?.notify(notifications);
}

function fullDump(notify: (notifications: NotificationPayload[]) => void) {
  console.log("full dump")
  mailService.fetchAll().then(notify);
}

notificationService = new NotificationService(fullDump)
mailService = new MailService(Configs.EMAIL, Configs.PASSWORD, SENDER_TO_NOTIFY, notify);


notificationService.init();
mailService.listen().catch(console.error);
