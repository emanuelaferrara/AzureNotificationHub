import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { parseNotificationEmail } from "./NotificationParser.ts";
import type { NotificationCategory } from "./NotificationParser.ts";

type Expectation = {
  file: string;
  category: NotificationCategory;
  action: string;
  initiator?: string;
  buildContext?: "pipeline" | "pr-build";
};

const EXPECTATIONS: Expectation[] = [
  { file: "pr created.eml", category: "pull-request", action: "created", initiator: "D'ANGIOLO RENATO" },
  { file: "pr completed.eml", category: "pull-request", action: "completed", initiator: "D'ANGIOLO RENATO" },
  { file: "pr abandoned.eml", category: "pull-request", action: "abandoned", initiator: "D'ANGIOLO RENATO" },
  { file: "pr approved.eml", category: "pull-request", action: "approved", initiator: "D'AURIA FRANCESCO" },
  { file: "pr rejected.eml", category: "pull-request", action: "rejected", initiator: "D'ANGIOLO RENATO" },
  {
    file: "pr is waiting for the author.eml",
    category: "pull-request",
    action: "waiting-for-author",
    initiator: "LONGO ALESSANDRO",
  },
  { file: "pr add reviewrs.eml", category: "pull-request", action: "reviewers-added", initiator: "D'ANGIOLO RENATO" },
  { file: "pr push new changes.eml", category: "pull-request", action: "pushed", initiator: "D'ANGIOLO RENATO" },
  {
    file: "pr updated the title or description.eml",
    category: "pull-request",
    action: "title-description-updated",
    initiator: "D'ANGIOLO RENATO",
  },
  {
    file: "pr has commented.eml",
    category: "pull-request-comment",
    action: "commented",
    initiator: "LONGO ALESSANDRO",
  },
  {
    file: "pipeline succeded.eml",
    category: "build",
    action: "succeeded",
    initiator: "DANIELE MARCO",
    buildContext: "pipeline",
  },
  {
    file: "pipeline canceled.eml",
    category: "build",
    action: "canceled",
    initiator: "DANIELE MARCO",
    buildContext: "pipeline",
  },
  { file: "pipeline partially succeded.eml", category: "build", action: "partially-succeeded", buildContext: "pipeline" },
  { file: "pr build succeded.eml", category: "build", action: "succeeded", buildContext: "pr-build" },
  { file: "pr build failed.eml", category: "build", action: "failed", buildContext: "pr-build" },
  { file: "pr build canceled.eml", category: "build", action: "canceled", buildContext: "pr-build" },
  { file: "issue mentioned you.eml", category: "mention", action: "mentioned", initiator: "CORPINO PAOLO" },
];

describe("parseNotificationEmail", () => {
  it.each(EXPECTATIONS)("$file -> category=$category action=$action", async (expected) => {
    const source = await readFile(new URL(`./__fixtures__/${expected.file}`, import.meta.url));
    const result = await parseNotificationEmail(source);

    expect(result.category).toBe(expected.category);
    expect(result.metadata.action).toBe(expected.action);
    expect(result.metadata.initiator).toBe(expected.initiator);
    expect(result.metadata.buildContext).toBe(expected.buildContext);
    expect(result.url).toMatch(/^https:\/\/dev\.azure\.com/);
    expect(result.id).not.toBe("");
    expect(result.title).not.toMatch(/^\[EXTERNAL\]/);
  });
});
