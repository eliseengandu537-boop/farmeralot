import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
if (!["dev", "build", "start"].includes(args[0])) throw new Error("Choose dev, build, or start.");
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), ...args], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_STOREFRONT_MODE: "preview" },
});
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
