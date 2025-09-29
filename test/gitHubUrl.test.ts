import { describe, expect, it } from "vitest"
import { gitHubUrl } from "../src/gitHubUrl";
import type {GitHubTarget} from "../src/types";

describe("gitHubUrl module", () => {
    it("should parse a basic repository URL", () => {
        const url = "https://github.com/microsoft/typescript";

        const result = gitHubUrl.parse(url);

        expect(result).toEqual({ kind: "repo", owner: "microsoft", repo:"typescript"});
    });

    it("should build a URL from repo target", () => {
        const target: GitHubTarget = { kind: "repo", owner: "microsoft", repo: "typescript" };

        const result = gitHubUrl.build(target);

        expect(result.toString()).toBe("https://github.com/microsoft/typescript");
    });
});