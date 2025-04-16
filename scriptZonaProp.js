import axios from "axios";
import Promise from "bluebird";
import _ from "lodash";
import fs from "fs/promises";
import { Table } from 'console-table-printer';
import * as cheerio from "cheerio";

const FILENAME = `./zonaPropResults.js`;
let lastResults = [];

// Lista de barrios a filtrar
const BARRIOS_FILTER = [
	"Recoleta",
	"Palermo",
	"Belgrano",
	"Núñez",
	"Barrio Norte",
	"Las Cañitas",
	"Colegiales",
	"Villa Crespo",
	"Caballito",
	"Almagro"
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
	} catch (e) {
		lastResults = [];
	}
}

console.log("BUSCANDO EN ZONA PROP.................");

const falopaToNumber = falopa => parseInt(_.filter(falopa, it => _.isFinite(parseInt(it))).join("")) || 0;

const table = new Table({
	columns: [
		{ name: "title", alignment: "left" },
		{ name: "m2" },
		{ name: "rooms" },
		{ name: "expensas" },
		{ name: "price" },
		{ name: "total" },
		{ name: "location", alignment: "left" },
		{ name: "barrio", alignment: "left" },
		{ name: "tipo", alignment: "left" },
		{ name: "permalink", alignment: "left", maxLen: 10 }
	],
	sort: (r1, r2) => r2.rooms - r1.rooms || r1.price - r2.price || r2.m2 - r1.m2
});

// Función para extraer el barrio de la ubicación
function extractBarrio(location) {
	const barrio = BARRIOS_FILTER.find(b => 
		location.toLowerCase().includes(b.toLowerCase())
	);
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
		const data = await fs.readFile(`./htmls/zonaprop${page}.html`, 'utf8');
		const $ = cheerio.load(data);
		return {
			results: $('article[data-posting-type="PROPERTY"]').get().map(it => {
				const price = falopaToNumber($(it).find('[data-qa="POSTING_CARD_PRICE"]').text());
				const expensas = falopaToNumber($(it).find('[data-qa="POSTING_CARD_EXPENSES"]').text());
				const location = _.trim($(it).find('[data-qa="POSTING_CARD_LOCATION"]').text().replace(/\r?\n|\r/g, " "));
				const barrio = extractBarrio(location);
				const title = _.trim($(it).find('[data-qa="POSTING_CARD_TITLE"]').text().replace(/\r?\n|\r/g, " "));
				const tipo = extractTipo(title);
				
				return {
					price,
					expensas,
					rooms: falopaToNumber($(it).find('[data-qa="POSTING_CARD_FEATURES"] span').filter((i, el) => new RegExp(/amb/, "gi").test($(el).text())).first().text()),
					m2: falopaToNumber($(it).find('[data-qa="POSTING_CARD_FEATURES"] span').filter((i, el) => new RegExp(/[0-9]+ m/, "gi").test($(el).text())).first().text()),
					total: price + expensas,
					location,
					barrio,
					tipo,
					permalink: `https://www.zonaprop.com.ar${$(it).find('a').first().attr("href")}`,
					id: $(it).attr("data-id"),
					title: _.truncate(title, { length: 20 })
				};
			}),
			count: parseInt(_.get($('[data-qa="SEARCH_RESULTS_TOTAL"]').text().split(" "), 0))
		};
	});

	const combinedResults = results.reduce((a, b) => ({
		results: a.results.concat(b.results),
		count: a.count
	}));

	console.log("Encontre", combinedResults.results.length, "Deberia haber", combinedResults.count);

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
		filteredResults = filteredResults.filter(result => 
			BARRIOS_FILTER.some(barrio => 
				result.location.toLowerCase().includes(barrio.toLowerCase())
			)
		);
	}

	console.log("Filtrado por barrios:", FILTERS.barrios ? "Sí" : "No");
	console.log("Mostrar venta:", FILTERS.venta ? "Sí" : "No");
	console.log("Mostrar alquiler:", FILTERS.alquiler ? "Sí" : "No");
	console.log("Resultados filtrados:", filteredResults.length);

	const newResults = _.uniqBy(lastResults.concat(filteredResults), "id");
	await fs.writeFile(FILENAME, JSON.stringify(newResults));

	const newFilteredResults = filteredResults.filter(result => !_.some(lastResults, it => it.id == result.id));
	console.log("Solo ", newFilteredResults.length, "son nuevos");
	console.log("------------------------------------------------------------------------------------------------------------------------------------------");

	// Agrupar por barrio y tipo
	const groupedResults = _.groupBy(newFilteredResults, result => `${result.barrio} - ${result.tipo}`);
	Object.entries(groupedResults).forEach(([group, props]) => {
		console.log(`\n${group} (${props.length} propiedades):`);
		table.addRows(props);
		table.printTable();
		table.table.rows = []; // Limpiar la tabla para el siguiente grupo
	});

	console.log("FIN TABLA ZONA PROP.............");
}

main().catch(console.error);

