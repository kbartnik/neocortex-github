import { importCommand } from "./commands/import";

export async function runCLI(args: string[]): Promise<void> {
  const [command, url] = args;

  if (command === "import" && url) {
    const result = await importCommand([url]);

    result.match(
      (nodes) => {
        console.log(`✓ Imported ${nodes.length} issue(s)`)
        process.exit(0);
      },
      () => {
        process.exit(1);
      }
    );
  }
}
