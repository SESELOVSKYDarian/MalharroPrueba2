const { spawn } = require("child_process");

const tasks = [
  { name: "frontend", command: "npm", args: ["run", "dev:frontend"] },
  { name: "backend", command: "npm", args: ["run", "dev:backend"] },
];

const processes = [];

function startTask(task) {
  const child = spawn(task.command, task.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`La tarea ${task.name} finalizó con código ${code}`);
      shutdown(code);
    }
  });

  processes.push(child);
}

function shutdown(code = 0) {
  processes.forEach((proc) => {
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  });
  process.exit(code);
}

process.on("SIGINT", () => {
  console.log("\nDeteniendo procesos...");
  shutdown(0);
});

process.on("SIGTERM", () => {
  shutdown(0);
});

for (const task of tasks) {
  startTask(task);
}
