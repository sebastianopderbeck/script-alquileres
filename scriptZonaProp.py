import requests
from bs4 import BeautifulSoup
import json
import os
import time
from datetime import datetime
from pathlib import Path
import re

# Configuración
HTML_DIR = './htmls'
RESULTS_FILE = 'zonaPropResults.json'

# URLs a scrapear
BASE_URL = 'https://www.zonaprop.com.ar/departamentos-ph-alquiler-villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro-mas-de-3-ambientes.html'
PAGES = [BASE_URL] + [f'https://www.zonaprop.com.ar/departamentos-ph-alquiler-villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro-mas-de-3-ambientes-pagina-{i}.html' for i in range(2, 11)]

# Headers para simular un navegador
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
}

def ensure_html_dir():
    """Asegura que existe el directorio para los archivos HTML"""
    Path(HTML_DIR).mkdir(parents=True, exist_ok=True)

def extract_number(text):
    """Extrae números de un texto"""
    if not text:
        return 0
    numbers = re.findall(r'\d+', text)
    return int(''.join(numbers)) if numbers else 0

def download_page(url, page_number):
    """Descarga una página y la guarda en un archivo"""
    filename = f"{HTML_DIR}/zonaprop{page_number}.html"
    
    # Verificar si el archivo existe y es reciente (menos de 1 hora)
    if os.path.exists(filename):
        file_time = os.path.getmtime(filename)
        if time.time() - file_time < 3600:  # 1 hora en segundos
            print(f"Usando archivo existente para página {page_number}")
            return
    
    print(f"Descargando página {page_number}...")
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"Página {page_number} guardada en {filename}")
        
        # Esperar un poco entre solicitudes para no sobrecargar el servidor
        time.sleep(2)
    except Exception as e:
        print(f"Error al descargar página {page_number}: {str(e)}")
        raise

def load_last_results():
    """Carga los resultados anteriores"""
    try:
        with open(RESULTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("No se encontraron resultados anteriores")
        return []
    except json.JSONDecodeError:
        print("Error al leer el archivo de resultados")
        return []

def save_results(results):
    """Guarda los resultados en un archivo JSON"""
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def extract_property_data(soup, url):
    """Extrae los datos de las propiedades de una página"""
    properties = []
    cards = soup.select('div[data-qa="posting PROPERTY"]')
    
    for card in cards:
        try:
            # Extraer precio y expensas
            price_text = card.select_one('[data-qa="POSTING_CARD_PRICE"]').text if card.select_one('[data-qa="POSTING_CARD_PRICE"]') else ''
            expensas_text = card.select_one('[data-qa="expensas"]').text if card.select_one('[data-qa="expensas"]') else ''
            
            # Extraer características
            features = card.select('[data-qa="POSTING_CARD_FEATURES"] span')
            rooms = 0
            m2 = 0
            for feature in features:
                text = feature.text.lower()
                if 'amb' in text:
                    rooms = extract_number(text)
                elif 'm²' in text:
                    m2 = extract_number(text)
            
            # Extraer ubicación y título
            location = card.select_one('[data-qa="POSTING_CARD_LOCATION"]').text.strip() if card.select_one('[data-qa="POSTING_CARD_LOCATION"]') else ''
            title = card.select_one('[data-qa="POSTING_CARD_DESCRIPTION"] a').text.strip() if card.select_one('[data-qa="POSTING_CARD_DESCRIPTION"] a') else ''
            
            # Extraer link e ID
            link = card.select_one('[data-qa="POSTING_CARD_DESCRIPTION"] a')
            permalink = link['href'] if link else ''
            property_id = card.get('data-id', '')
            
            # Calcular total
            price = extract_number(price_text)
            expensas = extract_number(expensas_text)
            total = price + expensas
            
            # Extraer dirección específica
            address = card.select_one('.postingLocations-module__location-address').text.strip() if card.select_one('.postingLocations-module__location-address') else ''
            
            properties.append({
                'price': price,
                'expensas': expensas,
                'total': total,
                'rooms': rooms,
                'm2': m2,
                'location': location,
                'address': address,
                'permalink': permalink,
                'id': property_id,
                'title': title[:50]  # Limitar el título a 50 caracteres
            })
        except Exception as e:
            print(f"Error al extraer datos de una propiedad: {str(e)}")
            continue
    
    return properties

def main():
    print("Iniciando búsqueda de propiedades en ZonaProp...")
    ensure_html_dir()
    
    # Cargar resultados anteriores
    last_results = load_last_results()
    print(f"Cargados {len(last_results)} resultados anteriores")
    
    all_properties = []
    
    # Procesar cada página
    for i, url in enumerate(PAGES, 1):
        try:
            download_page(url, i)
            
            # Leer el archivo HTML
            with open(f"{HTML_DIR}/zonaprop{i}.html", 'r', encoding='utf-8') as f:
                html = f.read()
            
            soup = BeautifulSoup(html, 'html.parser')
            properties = extract_property_data(soup, url)
            all_properties.extend(properties)
            
            print(f"Página {i}: Encontradas {len(properties)} propiedades")
            
        except Exception as e:
            print(f"Error al procesar página {i}: {str(e)}")
            continue
    
    # Filtrar propiedades nuevas
    new_properties = [
        prop for prop in all_properties
        if not any(existing['id'] == prop['id'] for existing in last_results)
    ]
    
    # Combinar resultados
    updated_results = last_results + new_properties
    
    # Guardar resultados
    save_results(updated_results)
    
    # Mostrar estadísticas
    print("\nEstadísticas:")
    print(f"Total de propiedades encontradas: {len(all_properties)}")
    print(f"Propiedades nuevas: {len(new_properties)}")
    print(f"Total de propiedades guardadas: {len(updated_results)}")

if __name__ == "__main__":
    main() 