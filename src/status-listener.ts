import { Bot } from "./bot";
import { logger } from "./logger";

export class StatusListener {

	bot: Bot;

	constructor(bot: Bot){
		this.bot = bot;
	}

	subscribeOnConnect() {
		this.bot.subscribe('connect', (addr, port) => {
			logger.info('CONNECTED TO: %s:%s', addr, port);
		})
	}

}

