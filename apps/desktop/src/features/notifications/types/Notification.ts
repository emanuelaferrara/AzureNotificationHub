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

export type Notification = {
  id: string;
  title: string;
  body: string;
  // category: NotificationCategory;
  url?: string;
  createdAt: string;
  read: boolean;
  // metadata: NotificationMetadata;
};
