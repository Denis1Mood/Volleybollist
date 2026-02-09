import { spawn, type ChildProcess } from "node:child_process";
import { config } from "./config.js";

let currentProcess: ChildProcess | null = null;

const startProcess = (command: string, label: string): ChildProcess => {
  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (currentProcess === child) {
      currentProcess = null;
    }
    console.info(`[${label}] завершено. code=${code ?? "n/a"} signal=${signal ?? "n/a"}`);
  });

  child.on("error", (error) => {
    console.error(`[${label}] ошибка запуска:`, error);
  });

  return child;
};

const ensureCommand = (command: string, label: string) => {
  if (!command) {
    throw new Error(`${label} не задана в переменных окружения.`);
  }
};

const launchProgram = () => {
  ensureCommand(config.programCommand, "PROGRAM_COMMAND");

  if (currentProcess) {
    return currentProcess;
  }

  currentProcess = startProcess(config.programCommand, "program");
  return currentProcess;
};

const stopProgram = () => {
  if (!currentProcess) {
    return false;
  }

  const stopped = currentProcess.kill();
  currentProcess = null;
  return stopped;
};

const restartProgram = () => {
  stopProgram();
  return launchProgram();
};

const runServerCommand = () => {
  if (!config.serverCommand) {
    return null;
  }

  return startProcess(config.serverCommand, "server");
};

const isRunning = () => Boolean(currentProcess && !currentProcess.killed);

export const programManager = {
  launchProgram,
  stopProgram,
  restartProgram,
  runServerCommand,
  isRunning,
};
