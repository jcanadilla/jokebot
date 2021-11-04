import _ from "lodash";

export class Joke {

	titulo;
	categorias: string[] = [];
	texto;
	tags: string[] = [];
	count: number = 0;

	constructor(
		title = '',
		categorias: string[] = [],
		texto = '',
		tags: string[] = [],
	) {
		_.assign(this, {
			title,
			categorias,
			texto,
			tags,
		});
	}
}