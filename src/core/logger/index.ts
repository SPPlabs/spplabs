/**
 * Core logging utility for the AI infrastructure.
 * Ensures operational logging only.
 * MUST NOT log user messages, client knowledge content, embeddings, or API keys.
 */

type LogArgs = unknown[];

export const logger = {
  info(message: string, ...args: LogArgs): void {
    console.log(`[AI-INFRA][INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },

  warn(message: string, ...args: LogArgs): void {
    console.warn(`[AI-INFRA][WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },

  error(message: string, ...args: LogArgs): void {
    console.error(`[AI-INFRA][ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },

  debug(message: string, ...args: LogArgs): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AI-INFRA][DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
