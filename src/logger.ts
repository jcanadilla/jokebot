import pino from 'pino';
import {LoggerOptions} from 'pino';

export const logger = pino(<LoggerOptions> {
    level: 'debug',
    name: 'Jokebot',
	base: null,
    prettyPrint: true,
    timestamp: true,
	redact: ['*.password'],
});
