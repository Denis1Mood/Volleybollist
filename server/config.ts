const parseChatIds = (raw: string | undefined): number[] => {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
};

const parseNumber = (raw: string | undefined, fallback: number): number => {
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  allowedChatIds: parseChatIds(process.env.TELEGRAM_ALLOWED_CHAT_IDS),
  programCommand: process.env.PROGRAM_COMMAND ?? "",
  serverCommand: process.env.SERVER_COMMAND ?? "",
  serverCommandDelayMs: parseNumber(process.env.SERVER_COMMAND_DELAY_MS, 15000),
};
