import axios from "axios";
import Promise from "bluebird";
import _ from "lodash";
import fs from "fs/promises";
import * as cheerio from "cheerio";

const FILENAME = `./argenPropResults.js`;
let lastResults = [];

// Lista de barrios a filtrar
const BARRIOS_FILTER = [
	"Villa Urquiza",
	"Villa Devoto",
	"Villa Del Parque",
	"Villa Pueyrredon",
	"Monte Castro",
	"Villa Crespo"
];

// Configuración de filtros
const FILTERS = {
	barrios: true, // Activar/desactivar filtro de barrios
	venta: true,   // Mostrar propiedades en venta
	alquiler: true // Mostrar propiedades en alquiler
};

async function loadLastResults() {
	try {
		const data = await fs.readFile(FILENAME, 'utf8');
		lastResults = JSON.parse(data);
	}
	catch (e) {
		lastResults = [];
	}
}

const falopaToNumber = falopa => parseInt(_.filter(falopa, it => _.isFinite(parseInt(it))).join("")) || 0;

// Función para extraer el barrio de la ubicación
function extractBarrio(location) {
	const locationNormalized = location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	const barrio = BARRIOS_FILTER.find(b => {
		const barrioNormalized = b.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		return locationNormalized.includes(barrioNormalized);
	});
	return barrio || "Otro";
}

// Función para determinar el tipo de operación
function extractTipo(title) {
	if (title.toLowerCase().includes('alquiler')) return 'Alquiler';
	if (title.toLowerCase().includes('venta')) return 'Venta';
	return 'Otro';
}

async function main() {
	await loadLastResults();

	const results = await Promise.map([1, 2, 3], async page => {
		const data = await fs.readFile(`./htmls/argenprop${page}.html`, 'utf8');
		const $ = cheerio.load(data);
		return {
			results: $('.listing__item').get().map(it => {
				const price = falopaToNumber($(it).find(".card__price").text());
				const expensas = falopaToNumber($(it).find(".card__expenses").text());
				const features = $(it).find(".card__main-features li");
				const location = _.trim($(it).find(".card__address").text().replace(/\r?\n|\r/g, " "));
				const barrio = extractBarrio(location);
				const title = _.trim($(it).find(".card__title--primary").text().replace(/\r?\n|\r/g, " "));
				const tipo = extractTipo(title);
				
				return {
					price,
					expensas,
					rooms: falopaToNumber(features.filter((i, el) => new RegExp(/dorm/, "gi").test($(el).text())).first().text()) + 1,
					m2: _(features)
						.map(it => $(it).text())
						.filter(it => new RegExp(/m²/, "gi").test(it))
						.map(falopaToNumber)
						.take(1)
						.value(),
					total: price + expensas,
					location,
					barrio,
					tipo,
					permalink: `https://www.argenprop.com${$(it).find("a").first().attr("href")}`,
					id: $(it).find("a").first().attr("data-item-card"),
					title: _.truncate(title, { length: 15 })
				}
			}),
			count: parseInt(_.replace(_.trim($('.listing-header__results').text()), /\D+/, ""))
		}
	});

	const combinedResults = results.reduce((a, b) => ({
		results: a.results.concat(b.results),
		count: a.count
	}));

	// Aplicar filtros
	let filteredResults = combinedResults.results;

	// Primero filtrar por tipo de operación
	if (FILTERS.venta || FILTERS.alquiler) {
		filteredResults = filteredResults.filter(result => {
			if (FILTERS.venta && result.tipo === 'Venta') return true;
			if (FILTERS.alquiler && result.tipo === 'Alquiler') return true;
			return false;
		});
	}

	// Luego filtrar por barrios si está activado
	if (FILTERS.barrios) {
		filteredResults = filteredResults.filter(result => {
			const locationNormalized = result.location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			return BARRIOS_FILTER.some(barrio => {
				const barrioNormalized = barrio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				return locationNormalized.includes(barrioNormalized);
			});
		});
	}

	const newResults = _.uniqBy(lastResults.concat(filteredResults), "id");
	await fs.writeFile(FILENAME, JSON.stringify(newResults));
}

main().catch(console.error);

