
import { Bot } from './src/bot';
import { Options } from 'tmi.js';
import { logger } from './src/logger';
import { config } from './config';
import { JokeListener } from './src/joke-listener';
import { JokeDAO } from './src/dao/joke';
import { RavenClient } from './src/ravendb';
import { StatusListener } from './src/status-listener';

logger.info('WELCOME TO JOKE BOT!');

try {
	(async () => {

		logger.info('CREATING BOT...');

		const options: Options = {
			channels: [config.CHANNEL_NAME],
			options: { debug: true, messagesLogLevel: "info" },
			connection: {
				reconnect: true,
				secure: true
			},
			identity: {
				username: config.BOT_USERNAME,
				password: `oauth:${config.TWITCH_OAUTH_TOKEN}`,
			},
		}
		logger.debug('BOT OPTIONS: %o', options);
	
		logger.debug('BOT INITIALIZED');
		const bot = new Bot(options);
		
		const statusListener = new StatusListener(bot);
		statusListener.subscribeOnConnect();

		// CONNECT!
		logger.info('CONNECTING...');
		await bot.connect();
		
		const jokeListener = new JokeListener(bot);
	
		jokeListener.subscribe();
	})();
} catch (error) {
	logger.error({ err: error }, 'An error ocurred');
}

process.on('unhandledRejection', (error: Error) => {
	logger.error({ err: error }, 'Unhandled error... :S');
})

