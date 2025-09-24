export enum LogLevel {}

export class Logger {
    info(message: string, data?: any) {

        const timestamp = new Date().toISOString();1

        console.info(`[${timestamp}] ℹ️ ${message}`, data || "");
    }
}