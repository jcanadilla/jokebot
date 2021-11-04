export class Category {
	
	id: string | undefined;
	nombre: string | undefined;
	slug: string | undefined;
	link: string | undefined;

	constructor(
		nombre = '',
		slug,
		link,
	) {
		Object.assign(this, {
			nombre,
			slug,
			link
		});
	}
}