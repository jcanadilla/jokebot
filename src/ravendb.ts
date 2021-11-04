
import { DocumentStore, IDocumentSession } from 'ravendb';
import { logger } from './logger';

export class RavenClient {

	static instance: DocumentStore;

	static getSession(): IDocumentSession  {
		return this.getInstance().openSession();
	}

	static getInstance(): DocumentStore {
		if (this.instance) {
			return this.instance;
		}

		try {
			this.instance = new DocumentStore('http://127.0.0.1:8080', 'jokebot');
			this.instance.initialize();
			return this.instance;
		} catch (error) {
			logger.error({ err: error }, 'Error initializing DocumentStore');
			throw error;
		}
	}
}
