import type { GitHubIssueNode } from "@ir/types";
import { Command } from "commander";
import { importCommand } from "./commands/import";

const program: Command = new Command();

program
  .name("neocortex")
  .description("Cognitive prosthetic for ADHD developers")
  .version("0.1.0");

program
  .command("import")
  .description("Import GitHub issues to intermediate representation")
  .argument("<url>", "GitHub repository or issue URL")
  .action(async (url: string) => {
    const result = await importCommand([url]);

    result.match(
      (node: GitHubIssueNode) => {
        console.log(`✓ Imported 1 issue`);
        console.log(`  - ${node.title}`);
        process.exit(0);
      },
      (error) => {
        console.error("✗ Import failed:", error);
        process.exit(1);
      },
    );
  });

program.parse();
