import _ from "lodash";
import { Bot } from "./bot";
import { CategoryDAO } from "./dao/category";
import { JokeDAO } from "./dao/joke";
import { Joke } from "./models/joke";


export class JokeListener {

	bot: Bot;

	constructor(bot: Bot) {
		this.bot = bot;
	}

	private isMyCommand (command) {
		return (command.toLowerCase() === '!chiste' || command.toLowerCase() === '!chistes');
	}

	public subscribe() {
		this.bot.subscribe('message', async (channel, tags, message, self) => {
			if (self) return;
			const [command, text] = message.split(' ');
			if (this.isMyCommand(command) && _.isEmpty(text)) {
				const joke = await JokeDAO.getRandomJoke() as Joke;
				this.bot.say(channel, `@${tags.username} ha pedido un chiste y aquí va:`);
				this.bot.say(channel, joke.texto);
				return;
			}

			if (this.isMyCommand(command) && !_.isEmpty(text)){
				const categoria = await CategoryDAO.getCategoryBy('slug', text);

				if (_.isNil(categoria)) {
					this.bot.say(channel, `@${tags.username} no existe la categoría: ${text}. Elige otra...`);
					return;
				}

				const joke = await JokeDAO.getJokeByCategory(categoria);
				this.bot.say(channel, `@${tags.username} ha pedido un chiste de ${text.toUpperCase()} y aquí va:`);
				this.bot.say(channel, joke.texto);
				return;
			}

			if (command.toLowerCase() === '!categorias') {
				const categoriasObjects = await CategoryDAO.getCategories();
				const categoriasNames = _.map(categoriasObjects, c => c.slug);
				this.bot.say(channel, `Los chistes pueden ser de estas categorias:`)
				this.bot.say(channel, categoriasNames.join(', '));
				return;
			}
		});
	}
}

