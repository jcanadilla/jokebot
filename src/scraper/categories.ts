
import puppeteer, { Page } from 'puppeteer';
import { logger } from '../logger';
import { Category } from '../models/category';
import { RavenClient } from '../ravendb';
import { CategoryDAO } from '../dao/category';
import slugger from 'slug';

async function saveAllCategories(page: Page) {

	const CATEGORIES_SELECTOR = '#sidebarContent > p';
	const CATEGORY_SELECTOR = '#sidebarContent > p:nth-child(INDEX) > a';

	const categoriesText = await page.evaluate((sel) => {
		return document.querySelectorAll(sel).length;
	}, CATEGORIES_SELECTOR);

	logger.debug({ categories: categoriesText || [] }, 'CATEGORIES FOUND');

	for (let index = 1; index <= categoriesText; index++) {
		const categorySelector = CATEGORY_SELECTOR.replace('INDEX', `${index}`);
		const element = await page.evaluate((sel) => {
			let element = document.querySelector(sel);

			if (!element) {
				return null;
			}

			let title = element.getAttribute('title');
			let link = element.getAttribute('href');
			return { title, link };
		}, categorySelector);
		
		if (element) {
			const { title, link } = element;
			const path = link.split('/') as [];
			let slug = path.pop() || '';
			slug = slug.replace('chistes-de-', '');
			slug = slug.replace('chistes-', '');
			slug = slugger(slug);

			logger.debug({ title, slug, link }, "CATEGORY");

			const category = new Category(title, slug, link);

			const session = RavenClient.getSession();
			await session.store(category);
			await session.saveChanges();
		}
	}

}


(async () => {
	const browser = await puppeteer.launch(
		{
			headless: false,
			args: ["--disable-setuid-sandbox"],
			'ignoreHTTPSErrors': true
		}
	);

	const page: Page = await browser.newPage();
	await page.goto('https://www.1000chistes.com/', { waitUntil: 'networkidle0', });

	await page.waitForSelector('#btTw', { visible: true });

	await saveAllCategories(page);

	await browser.close();
	process.exit(0)
})();


