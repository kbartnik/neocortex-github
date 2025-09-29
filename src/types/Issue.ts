export type Issue = {
    id: number;
    number: number;
    title: string;
    state: "open" | "closed";
    body: string | null;
};