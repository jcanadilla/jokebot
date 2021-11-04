import { Joke } from "../models/joke";
import { RavenClient } from "../ravendb";
import { Category } from "../models/category";
import { logger } from "../logger";
import _ from "lodash";

export class CategoryDAO {

	static async getCategories() {

		const categories = await RavenClient.getSession().query({
			collection: 'categories',
			documentType: Category
		}).all();

		return categories;
	}

	static async getCategoryBy(field: string, value: string) {
		logger.debug({ field, value }, 'CATEGORY TO SEARCH');
		const query = RavenClient.getSession().query(Category);
		query.whereEquals(field, value);
		const found = await query.singleOrNull();
		logger.debug({ found }, 'CATEGORY FOUND');
		return found;
	}

	static async saveCategories(categories: Category[]) {

		const session = RavenClient.getInstance();
		const bulkInsert = session.bulkInsert();

		for (let i = 0; i < categories.length; i++) {
			const category = categories[i];
			bulkInsert.store(category);
		}

		bulkInsert.finish();
	}
}
