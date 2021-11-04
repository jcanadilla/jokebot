import { Category } from "../models/category";
import { Joke } from "../models/joke";
import { RavenClient } from "../ravendb";
const randomNumber = require('random-number-csprng');

export class JokeDAO {

	static async getRandomJoke () {

		const jokes = await RavenClient.getSession().query({
			collection: 'jokes',
			documentType: Joke
		}).orderBy('count').all();

		const [joke] = jokes;
		joke.count++;
		
		const session = await RavenClient.getSession();
		await session.store(joke);
		await session.saveChanges();

		return joke;
	}

	static async getJokeByCategory (category: Category) {

		const jokes = await RavenClient.getSession().query({
			collection: 'jokes',
			documentType: Joke
		}).whereIn('categorias', [category.id]).orderBy('count').all();

		const [joke] = jokes;
		
		joke.count++;
		
		const session = await RavenClient.getSession();
		await session.store(joke);
		await session.saveChanges();

		return joke;
	}
}
