import { describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import { Logger, LogLevel } from './logger'

describe('Logger', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = {
            info: vi.spyOn(console, 'info')
        }
    })

    it('should call console.info when info() is invoked', () => {
        const logger = new Logger()

        logger.info('test message')

        expect(consoleSpy.info).toHaveBeenCalledOnce();
    })

    it('should format info messages with emoji prefix', () => {
        vi.setSystemTime('2023-01-01T12:00:00Z')
        const logger = new Logger()

        logger.info('test message');
        expect(consoleSpy.info).toHaveBeenCalledWith(
            '[2023-01-01T12:00:00.000Z] ℹ️ test message', '');
    })

    it('should add a timestamp to info messages', () => {
        vi.setSystemTime('2023-01-01T12:00:00.000Z')
        const logger = new Logger()

        logger.info('test message');

        expect(consoleSpy.info).toHaveBeenCalledWith(
            '[2023-01-01T12:00:00.000Z] ℹ️ test message', '');
    })

    it('should pass data parameter to console.info' , () => {
        vi.setSystemTime('2023-01-01T12:00:00.000Z')
        const logger = new Logger()
        const testData = { key: 'value' }

        logger.info('test message', testData)

        expect(consoleSpy.info)
            .toHaveBeenCalledWith('[2023-01-01T12:00:00.000Z] ℹ️ test message', testData)
    })
})