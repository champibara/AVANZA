const levels = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type Level = keyof typeof levels;

const currentLevel: Level = (process.env.LOG_LEVEL as Level) || "info";

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (levels[level] < levels[currentLevel]) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    msg,
    ...(meta ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
