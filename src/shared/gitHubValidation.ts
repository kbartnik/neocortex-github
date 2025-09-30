export const validateIssueState = (
    state: string, context?: {
        owner: string,
        repo: string,
        number: number
    }): "open" | "closed" => {
    if (state === "open" || state === "closed") {
        return state;
    }

    const contextMessage = context
        ? ` for ${context.owner}/${context.repo}#${context.number}`
        : "";

    throw new Error(
        `Invalid issue state: '${state}'${contextMessage}. Expected 'open' or 'closed'.`
    );
}