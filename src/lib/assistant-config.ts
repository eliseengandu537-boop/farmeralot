/** Demo is the default, independently of the catalogue's preview/live mode. */
export function isAssistantDemo() {
  return process.env.ASSISTANT_MODE !== "live";
}
