import { CategoryDAO } from "../dao/category";
import { Category } from "../models/category";
import { RavenClient } from "../ravendb";
import puppeteer, { Page } from 'puppeteer';
import { logger } from "../logger";
import { Joke } from "../models/joke";
import _ from 'lodash';
import Bluebird from 'bluebird';
import slug from "slug";

async function processCategory(page: Page, category: Category, pages: number) {

	const JOKE_COUNTER = 'body > section > section > section > article.chiste';
	const JOKE_SELECTOR = 'body > section > section > section > article:nth-child(INDEX).chiste';
	const NEXT_SELECTOR = '#nav-links > a:last-child';

	let haveNext = true;
	let pageIndex = 1;

	while (haveNext) {

		logger.info('PAGE: %s', pageIndex);

		await page.goto(`${category.link}/pagina/${pageIndex}` || '', { waitUntil: 'networkidle0', });

		await page.waitForSelector('#btTw', { visible: true });

		const jokesCounter = await page.evaluate((sel) => {
			return document.querySelectorAll(sel).length;
		}, JOKE_COUNTER);

		logger.debug({ jokes: jokesCounter || [] }, 'JOKES FOUND');

		for (let index = 1; index <= jokesCounter; index++) {
			const jokesSelector = JOKE_SELECTOR.replace('INDEX', `${index}`);

			const jokeCard = await page.evaluate((sel) => {
				let element = document.querySelector(sel);

				if (!element) {
					return null;
				}

				const [hgroupElem, categoriasElem, textoElem, tagsElem] = element.children;

				// Buscamos las cosas del chiste
				const title = hgroupElem.children[0].textContent;
				const categories = [...categoriasElem.children].map(c => c.text);
				const tags = [...tagsElem.children].map(c => c.text);
				const text = textoElem.textContent

				return { title, categories, tags, text };
			}, jokesSelector);


			if (jokeCard) {

				logger.debug({ joke: jokeCard }, "JOKE");

				let categorias = await Bluebird.map(jokeCard.categories, async (categoryText): Promise<string> => {
					categoryText = slug(categoryText)
					const category = await CategoryDAO.getCategoryBy('slug', categoryText);
					if(_.isNil(category)){
						return '';
					}
					return category.id || '';
				});

				_.remove(categorias, (e) => {
					return e  === '';
				});

				const joke = new Joke(jokeCard.title, categorias, jokeCard.text, jokeCard.tags);

				const session = RavenClient.getSession();
				await session.store(joke);
				await session.saveChanges();
			}
		}

		const next = await page.evaluate((sel) => {
			const element = document.querySelector(sel);

			if (!element) {
				return false;
			}

			if (element.text === 'Siguiente >') {
				return true;
			}
			return false;
		}, NEXT_SELECTOR);

		logger.info('PAGE FINISHED: %s', pageIndex);

		haveNext = next;
		pageIndex++;
	}
}



(async () => {

	const browser = await puppeteer.launch(
		{
			headless: false,
			args: ["--disable-setuid-sandbox"],
			'ignoreHTTPSErrors': true,
			'devtools': true,
		}
	);

	const page: Page = await browser.newPage();

	const categories = await RavenClient.getSession().query({ collection: 'Categories' }).all() as Category[];

	if (_.isNil(categories)) {
		throw new Error('Category is undefined!');
	}

	await Bluebird.each(categories, async (category) => {
		logger.info('PROCESSING CATEGORY: %s', category.nombre);
		await processCategory(page, category, 2);
	});

	await browser.close();
	logger.info('ALL SAVED!');
	process.exit(0);
})();

process.on('unhandledRejection', (error) => {
	console.log(error);
	process.exit(1);
})
