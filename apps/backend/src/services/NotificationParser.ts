import { simpleParser } from "mailparser";
import type { Headers } from "mailparser";

export type NotificationCategory =
  | "pull-request"
  | "pull-request-comment"
  | "build"
  | "mention"
  | "work-item"
  | "push"
  | "approval"
  | "unknown";

export type NotificationMetadata = {
  org?: string;
  project?: string;
  repo?: string;
  initiator?: string;
  action: string;
  buildContext?: "pipeline" | "pr-build";
  trigger?: string;
};

export type NotificationPayload = {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  url?: string;
  createdAt: string;
  read: boolean;
  metadata: NotificationMetadata;
};

const EVENT_TYPE_TO_CATEGORY: Record<string, NotificationCategory> = {
  "ms.vss-code.git-pullrequest-event": "pull-request",
  "ms.vss-code.git-pullrequest-comment-event": "pull-request-comment",
  "ms.vss-build.build-completed-event": "build",
  "ms.vss-mentions.identity-mention-event": "mention",
  "ms.vss-work.workitem-changed-event": "work-item",
  "ms.vss-code.git-push-event": "push",
  "ms.vss-pipelinechecks-events.approval-pending": "approval",
};

const BUILD_TRIGGER_TO_ACTION: Record<string, string> = {
  "Successfully Completed": "succeeded",
  Failed: "failed",
  Stopped: "canceled",
  "Partially Succeeded": "partially-succeeded",
};

const PR_TRIGGER_TO_ACTION: Record<string, string> = {
  PullRequestCreatedNotification: "created",
  ReviewersUpdateNotification: "reviewers-added",
  PushNotification: "pushed",
  TitleDescriptionUpdatedNotification: "title-description-updated",
};

// Work-item mails carry a comma-joined trigger listing every change kind that fired
// (e.g. "FieldChanged,StateChanged,BoardColumnChanged"). Collapse to the single most
// notable change, highest priority first.
const WORK_ITEM_CHANGE_PRIORITY: Array<[string, string]> = [
  ["CommentAdded", "commented"],
  ["StateChanged", "state-changed"],
  ["LinksAdded", "linked"],
  ["SingleLinkAdded", "linked"],
  ["BoardColumnChanged", "board-column-changed"],
  ["TextFieldChanged", "field-changed"],
  ["FieldChanged", "field-changed"],
];

// StatusUpdateNotification and ReviewerVoteNotification are ambiguous on their own
// (they cover several distinct outcomes), so disambiguate using the small, stable
// set of phrases Microsoft's email template renders into the plaintext body.
const STATUS_UPDATE_PHRASES: Array<[string, string]> = [
  ["completed the pull request", "completed"],
  ["abandoned the pull request", "abandoned"],
];

const REVIEWER_VOTE_PHRASES: Array<[string, string]> = [
  ["approved the changes", "approved"],
  ["approved with suggestions", "approved-with-suggestions"],
  ["has rejected the changes", "rejected"],
  ["is waiting for the author", "waiting-for-author"],
];

const ACTION_TO_PHRASE: Record<string, string> = {
  created: "created a new pull request",
  completed: "completed the pull request",
  abandoned: "abandoned the pull request",
  approved: "approved the changes",
  "approved-with-suggestions": "approved with suggestions",
  rejected: "has rejected the changes",
  "waiting-for-author": "is waiting for the author to respond",
  "reviewers-added": "added reviewers to the pull request",
  pushed: "pushed new changes",
  "title-description-updated": "updated the title or description",
  commented: "commented on the pull request",
  mentioned: "mentioned you",
  succeeded: "build succeeded",
  failed: "build failed",
  canceled: "build canceled",
  "partially-succeeded": "build partially succeeded",
};

// Work-item actions reuse some keys (e.g. "commented") that mean something different in the
// pull-request world, so they get their own phrases resolved by category in buildBody.
const WORK_ITEM_ACTION_TO_PHRASE: Record<string, string> = {
  commented: "commented on the work item",
  "state-changed": "changed the work item state",
  "board-column-changed": "moved the work item on the board",
  linked: "linked the work item",
  "field-changed": "updated the work item",
};

function stringHeader(headers: Headers, name: string): string | undefined {
  const value = headers.get(name);
  return typeof value === "string" ? value : undefined;
}

function extractUrl(html: string | false): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return undefined;
  try {
    const target = JSON.parse(match[1])?.potentialAction?.target;
    return typeof target === "string" ? target : undefined;
  } catch {
    return undefined;
  }
}

function detectPrAction(trigger: string | undefined, text: string): string {
  if (!trigger) return "unknown";
  if (trigger in PR_TRIGGER_TO_ACTION) return PR_TRIGGER_TO_ACTION[trigger];
  if (trigger === "StatusUpdateNotification") {
    return STATUS_UPDATE_PHRASES.find(([phrase]) => text.includes(phrase))?.[1] ?? "unknown";
  }
  if (trigger === "ReviewerVoteNotification") {
    return REVIEWER_VOTE_PHRASES.find(([phrase]) => text.includes(phrase))?.[1] ?? "unknown";
  }
  return "unknown";
}

function detectWorkItemAction(trigger: string | undefined): string {
  if (!trigger) return "unknown";
  const kinds = trigger.split(",").map((kind) => kind.trim());
  return WORK_ITEM_CHANGE_PRIORITY.find(([kind]) => kinds.includes(kind))?.[1] ?? "unknown";
}

function buildBody(
  category: NotificationCategory,
  action: string,
  initiator: string | undefined,
  title: string,
): string {
  // push/approval subjects already describe the event ("X pushed to the Y repository").
  if (category === "push" || category === "approval") return title;
  const phrase = category === "work-item" ? WORK_ITEM_ACTION_TO_PHRASE[action] : ACTION_TO_PHRASE[action];
  return initiator && phrase ? `${initiator} ${phrase}` : title;
}

function parseScope(scope: string | undefined): { org?: string; project?: string; repo?: string } {
  if (!scope) return {};
  const [org, project, repo] = scope.split("/");
  return { org, project, repo };
}

export async function parseNotificationEmail(
  source: Buffer,
  read: boolean = false,
): Promise<NotificationPayload> {
  const parsed = await simpleParser(source);

  const eventType = stringHeader(parsed.headers, "x-vss-event-type");
  const trigger = stringHeader(parsed.headers, "x-vss-event-trigger");
  const initiator = stringHeader(parsed.headers, "x-vss-event-initiator");
  const scope = stringHeader(parsed.headers, "x-vss-scope");

  const category: NotificationCategory = (eventType ? EVENT_TYPE_TO_CATEGORY[eventType] : undefined) ?? "unknown";
  const { org, project, repo } = parseScope(scope);

  let action = "unknown";
  let buildContext: "pipeline" | "pr-build" | undefined;

  if (category === "build") {
    action = (trigger ? BUILD_TRIGGER_TO_ACTION[trigger] : undefined) ?? "unknown";
    buildContext = repo ? "pr-build" : "pipeline";
  } else if (category === "mention") {
    action = "mentioned";
  } else if (category === "pull-request-comment") {
    action = "commented";
  } else if (category === "pull-request") {
    action = detectPrAction(trigger, parsed.text ?? "");
  } else if (category === "work-item") {
    action = detectWorkItemAction(trigger);
  } else if (category === "push") {
    action = "pushed";
  } else if (category === "approval") {
    // approval-pending mails carry no initiator/trigger header.
    action = "pending";
  }

  const title = (parsed.subject ?? "").replace(/^\[EXTERNAL\]\s*/, "");
  const body = buildBody(category, action, initiator, title);

  const id = parsed.messageId?.replace(/^<|>$/g, "") ?? crypto.randomUUID();

  return {
    id,
    title,
    body,
    category,
    url: extractUrl(parsed.html),
    createdAt: (parsed.date ?? new Date()).toISOString(),
    read,
    metadata: { org, project, repo, initiator, action, buildContext, trigger },
  };
}
