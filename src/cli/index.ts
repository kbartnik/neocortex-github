import { importCommand } from "./commands/import";

export async function runCLI(args: string[]): Promise<void> {
  const [command] = args;

  if (command === "import") {
    await importCommand(args.slice(1));
  }
}
