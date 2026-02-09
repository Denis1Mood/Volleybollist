import TelegramBot from "node-telegram-bot-api";
import { config } from "./config.js";
import { programManager } from "./processManager.js";
import { scheduler } from "./scheduler.js";

if (!config.botToken) {
  console.error("TELEGRAM_BOT_TOKEN не задан. Добавьте его в .env.");
  process.exit(1);
}

const bot = new TelegramBot(config.botToken, { polling: true });

const isAuthorized = (chatId: number) => {
  if (config.allowedChatIds.length === 0) {
    return true;
  }

  return config.allowedChatIds.includes(chatId);
};

const requireAuthorization = (chatId: number) => {
  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "Доступ запрещен. Добавьте chat_id в TELEGRAM_ALLOWED_CHAT_IDS.");
    return false;
  }

  return true;
};

const formatDate = (value: Date | null) => {
  if (!value) {
    return "не запланировано";
  }

  return value.toLocaleString();
};

const helpMessage = `Доступные команды:
/launch - запуск программы
/restart - перезапуск программы
/stop - остановка программы
/schedule HH:MM - ежедневный перезапуск по расписанию
/schedule off - отключить расписание
/status - статус программы и расписания
/help - справка
`;

bot.onText(/\/(start|help)/, (msg) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  bot.sendMessage(msg.chat.id, helpMessage);
});

bot.onText(/\/launch/, (msg) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  try {
    programManager.launchProgram();
    bot.sendMessage(msg.chat.id, "Программа запущена.");

    if (config.serverCommand) {
      setTimeout(() => {
        programManager.runServerCommand();
      }, config.serverCommandDelayMs);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось запустить программу.";
    bot.sendMessage(msg.chat.id, message);
  }
});

bot.onText(/\/restart/, (msg) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  try {
    programManager.restartProgram();
    bot.sendMessage(msg.chat.id, "Программа перезапущена.");

    if (config.serverCommand) {
      setTimeout(() => {
        programManager.runServerCommand();
      }, config.serverCommandDelayMs);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось перезапустить программу.";
    bot.sendMessage(msg.chat.id, message);
  }
});

bot.onText(/\/stop/, (msg) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  const stopped = programManager.stopProgram();
  bot.sendMessage(msg.chat.id, stopped ? "Программа остановлена." : "Программа уже была остановлена.");
});

bot.onText(/\/schedule(?:\s+(.+))?/, (msg, match) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  const argument = match?.[1]?.trim() ?? "";

  if (!argument) {
    bot.sendMessage(msg.chat.id, "Укажите время: /schedule HH:MM или /schedule off");
    return;
  }

  if (argument.toLowerCase() === "off") {
    scheduler.clear();
    bot.sendMessage(msg.chat.id, "Расписание отключено.");
    return;
  }

  try {
    scheduler.scheduleDaily(argument, () => {
      programManager.restartProgram();
      if (config.serverCommand) {
        setTimeout(() => {
          programManager.runServerCommand();
        }, config.serverCommandDelayMs);
      }
    });

    const status = scheduler.getStatus();
    bot.sendMessage(
      msg.chat.id,
      `Расписание обновлено. Следующий запуск: ${formatDate(status.nextRun)}.`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось настроить расписание.";
    bot.sendMessage(msg.chat.id, message);
  }
});

bot.onText(/\/status/, (msg) => {
  if (!requireAuthorization(msg.chat.id)) {
    return;
  }

  const status = scheduler.getStatus();
  const response = [
    `Программа: ${programManager.isRunning() ? "запущена" : "остановлена"}.`,
    `Расписание: ${status.time ?? "не задано"}.`,
    `Следующий запуск: ${formatDate(status.nextRun)}.`,
  ].join("\n");

  bot.sendMessage(msg.chat.id, response);
});

bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

console.info("Telegram bot запущен.");
