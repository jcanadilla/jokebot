
import { Client, Options } from 'tmi.js';
import { logger } from './logger';

export class Bot {

	client: Client;

	constructor(options: Options) {
		this.client = new Client(options);
	}

	public async connect() {
		try {
			await this.client.connect();
		} catch (error) {
			logger.error({ err: error }, 'Error connecting to chat :(');
			throw error;
		}
	}

	public async subscribe(event: any, callback: any) {
		try {
			this.client.on(event, callback);
		} catch (error) {
			logger.error({ err: error }, 'Error subscribing to event %s', event);
			throw error;;
		}
	}

	public async say(channel, message) {
		try {
			await this.client.say(channel, message);
		} catch (error) {
			logger.error({ err: error }, 'Error sending a message: %s', message);
			throw error;
		}
	}
}
