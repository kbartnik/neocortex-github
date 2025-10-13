import { importCommand } from "./commands/import";

export async function runCLI(args: string[]): Promise<void> {
  const [command] = args;

  if (command === "import") {
    const result = await importCommand(args.slice(1));

    result.match(
      () => {
        process.exit(0);
      },
      () => {
        // Handle error case (will implement in next test)
      },
    );
  }
}
