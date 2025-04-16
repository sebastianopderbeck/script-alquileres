const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const PAGES_TO_DOWNLOAD = 3; // Número de páginas a descargar

const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0'
};

const sites = {
    argenprop: {
        baseUrl: 'https://www.argenprop.com/departamento-alquiler',
        getPageUrl: (page) => `https://www.argenprop.com/departamento-alquiler?page=${page}`,
        getFileName: (page) => `argenprop${page}.html`
    },
    zonaprop: {
        baseUrl: 'https://www.zonaprop.com.ar/departamentos-alquiler.html',
        getPageUrl: (page) => `https://www.zonaprop.com.ar/departamentos-alquiler-pagina-${page}.html`,
        getFileName: (page) => `zonaprop${page}.html`
    }
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadPage(url, fileName) {
    try {
        const response = await axios.get(url, { headers });
        await fs.writeFile(path.join('htmls', fileName), response.data);
        console.log(`Downloaded ${fileName}`);
        return true;
    } catch (error) {
        console.error(`Error downloading ${fileName}:`, error.message);
        return false;
    }
}

async function downloadHtmls() {
    try {
        // Create htmls directory if it doesn't exist
        await fs.mkdir('htmls', { recursive: true });

        for (const [siteName, site] of Object.entries(sites)) {
            console.log(`\nDownloading ${siteName} pages...`);
            
            for (let page = 1; page <= PAGES_TO_DOWNLOAD; page++) {
                const url = site.getPageUrl(page);
                const fileName = site.getFileName(page);
                
                const success = await downloadPage(url, fileName);
                
                if (!success) {
                    console.log(`Stopping ${siteName} downloads due to error`);
                    break;
                }
                
                // Esperar entre 2 y 5 segundos entre cada descarga
                if (page < PAGES_TO_DOWNLOAD) {
                    const delay_ms = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
                    console.log(`Waiting ${delay_ms}ms before next request...`);
                    await delay(delay_ms);
                }
            }
        }

    } catch (error) {
        console.error('Error in download process:', error.message);
    }
}

downloadHtmls(); 