import * as z from "zod";

const ConfigSchema = z.object({
  EMAIL: z.string(),
  PASSWORD: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const Configs = ConfigSchema.parse(process.env);

export const SENDER_TO_NOTIFY = "azuredevops@microsoft.com"