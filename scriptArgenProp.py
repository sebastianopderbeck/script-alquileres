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
RESULTS_FILE = 'argenPropResults.json'

# URL base y páginas a procesar
BASE_URL = 'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes'
PAGES = [
    BASE_URL,  # primera página
    f'{BASE_URL}?pagina-2',
    f'{BASE_URL}?pagina-3',
    f'{BASE_URL}?pagina-4',
    f'{BASE_URL}?pagina-5',
    f'{BASE_URL}?pagina-6',
    f'{BASE_URL}?pagina-7',
    f'{BASE_URL}?pagina-8',
    f'{BASE_URL}?pagina-9',
    f'{BASE_URL}?pagina-10'
]

# Headers para simular un navegador
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1',
    'Referer': 'https://www.argenprop.com/',
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
    filename = f"{HTML_DIR}/argenprop{page_number}.html"
    
    print(f"Descargando página {page_number}...")
    try:
        session = requests.Session()
        
        # Primero visitamos la página principal para obtener cookies
        print("Visitando página principal...")
        session.get('https://www.argenprop.com/', headers=HEADERS)
        
        # Esperamos un poco
        time.sleep(2)
        
        # Ahora hacemos la solicitud real
        headers = HEADERS.copy()
        headers['Referer'] = 'https://www.argenprop.com/'
        response = session.get(url, headers=headers)
        response.raise_for_status()
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"Página {page_number} guardada en {filename}")
        
        # Verificamos si la página contiene el contenido esperado
        if 'listing__item' not in response.text and 'listing-item' not in response.text:
            print("Advertencia: La página descargada podría no contener resultados")
            print("Contenido de la página:")
            print(response.text[:500])  # Mostramos los primeros 500 caracteres
        
        # Esperamos entre solicitudes para evitar bloqueos
        time.sleep(7)
        
    except Exception as e:
        print(f"Error al descargar página {page_number}: {str(e)}")
        raise

def extract_property_data(soup):
    """Extrae los datos de las propiedades de una página"""
    properties = []
    print(f"Procesando URL: {BASE_URL}")
    
    # Buscar las tarjetas de propiedades
    cards = soup.select('.listing__item, .listing-item')
    print(f"Encontradas {len(cards)} tarjetas de propiedades")
    
    for card in cards:
        try:
            # Extraer precio y expensas
            price_element = card.select_one('.card__price, .price')
            expensas_element = card.select_one('.card__expenses, .expenses')
            
            price_text = price_element.text if price_element else ''
            expensas_text = expensas_element.text if expensas_element else ''
            
            print(f"Precio encontrado: {price_text}")
            print(f"Expensas encontradas: {expensas_text}")
            
            # Extraer características
            features = card.select('.card__main-features li, .features li')
            rooms = 0
            m2 = 0
            for feature in features:
                text = feature.text.lower()
                if 'dorm' in text or 'amb' in text:
                    rooms = extract_number(text)
                elif 'm²' in text or 'm2' in text:
                    m2 = extract_number(text)
            
            print(f"Ambientes: {rooms}, m²: {m2}")
            
            # Extraer ubicación y título
            location_element = card.select_one('.card__address, .address')
            title_element = card.select_one('.card__title--primary, .title')
            
            location = location_element.text.strip() if location_element else ''
            title = title_element.text.strip() if title_element else ''
            
            print(f"Ubicación: {location}")
            print(f"Título: {title}")
            
            # Extraer link e ID
            link = card.select_one('a')
            if link:
                permalink = f"https://www.argenprop.com{link['href']}" if link['href'].startswith('/') else link['href']
                property_id = link.get('data-item-card', '') or link.get('data-id', '') or permalink.split('-')[-1]
            else:
                permalink = ''
                property_id = ''
            
            print(f"Link: {permalink}")
            print(f"ID: {property_id}")
            
            # Calcular total
            price = extract_number(price_text)
            expensas = extract_number(expensas_text)
            total = price + expensas
            
            property_data = {
                'price': price,
                'expensas': expensas,
                'total': total,
                'rooms': rooms,
                'm2': m2,
                'location': location,
                'permalink': permalink,
                'id': property_id,
                'title': title,
                'source': 'ArgenProp'
            }
            
            print(f"Propiedad procesada: {property_data}")
            properties.append(property_data)
            
        except Exception as e:
            print(f"Error al extraer datos de una propiedad: {str(e)}")
            print(f"HTML de la tarjeta: {card}")
            continue
    
    print(f"Total de propiedades extraídas: {len(properties)}")
    return properties

def save_results(results):
    """Guarda los resultados en un archivo JSON"""
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def main():
    print("Iniciando búsqueda de propiedades en ArgenProp...")
    ensure_html_dir()
    
    all_properties = []
    
    # Procesar cada página
    for i, url in enumerate(PAGES, 1):
        try:
            print(f"\nProcesando página {i}: {url}")
            download_page(url, i)
            
            # Leer el archivo HTML
            with open(f"{HTML_DIR}/argenprop{i}.html", 'r', encoding='utf-8') as f:
                html = f.read()
            
            soup = BeautifulSoup(html, 'html.parser')
            properties = extract_property_data(soup)
            print(f"Propiedades extraídas de la página {i}: {len(properties)}")
            all_properties.extend(properties)
            
        except Exception as e:
            print(f"Error al procesar página {i}: {str(e)}")
            continue
    
    print(f"\nTotal de propiedades encontradas: {len(all_properties)}")
    
    # Guardar resultados
    save_results(all_properties)
    
    # Mostrar estadísticas
    print("\nEstadísticas finales:")
    print(f"Total de propiedades guardadas: {len(all_properties)}")
    
    # Mostrar algunas propiedades como ejemplo
    print("\nEjemplos de propiedades encontradas:")
    for prop in all_properties[:3]:  # Mostrar las primeras 3 propiedades
        print(f"\nPropiedad:")
        print(f"  ID: {prop['id']}")
        print(f"  Título: {prop['title']}")
        print(f"  Ubicación: {prop['location']}")
        print(f"  Precio: {prop['price']}")
        print(f"  Expensas: {prop['expensas']}")
        print(f"  Total: {prop['total']}")
        print(f"  Ambientes: {prop['rooms']}")
        print(f"  m²: {prop['m2']}")

if __name__ == "__main__":
    main() 