import os
import requests
from bs4 import BeautifulSoup
import json
import re
import time

def ensure_html_dir():
    """Asegura que existe el directorio para los archivos HTML"""
    os.makedirs('htmls', exist_ok=True)

def download_page(url, page_number):
    """Descarga una página y la guarda en un archivo"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
    
    try:
        print(f"Descargando página {page_number}...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Guardar el HTML en un archivo
        filename = f"htmls/zonaprop_page_{page_number}.html"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"Página {page_number} guardada en {filename}")
        return filename
        
    except Exception as e:
        print(f"Error al descargar la página {page_number}: {str(e)}")
        return None

def extract_number(text):
    """Extrae números de un texto"""
    if not text:
        return 0
    try:
        # Buscar números con puntos como separadores de miles
        numbers = re.findall(r'[\d\.]+', text)
        if numbers:
            # Convertir el número a entero, removiendo los puntos
            return int(numbers[0].replace('.', ''))
        return 0
    except (ValueError, TypeError):
        return 0

def extract_price(text):
    """Extrae el precio y expensas del texto"""
    price = 0
    expensas = 0
    
    if not text:
        return price, expensas
    
    try:
        # Buscar precio en USD
        price_match = re.search(r'USD\s*([\d\.]+)', text)
        if price_match:
            price = int(price_match.group(1).replace('.', ''))
        
        # Buscar precio en pesos
        if price == 0:
            price_match = re.search(r'\$\s*([\d\.]+)', text)
            if price_match:
                price = int(price_match.group(1).replace('.', ''))
        
        # Buscar expensas
        expensas_match = re.search(r'Expensas:\s*\$([\d\.]+)', text)
        if expensas_match:
            expensas = int(expensas_match.group(1).replace('.', ''))
    except (ValueError, TypeError):
        pass
    
    return price, expensas

def extract_rooms(text):
    """Extrae la cantidad de ambientes del texto"""
    if not text:
        return 0
    try:
        # Buscar patrones como "3 ambientes", "3 amb", etc.
        rooms_match = re.search(r'(\d+)\s*(?:amb|ambiente|ambientes)', text.lower())
        if rooms_match:
            return int(rooms_match.group(1))
        return 0
    except (ValueError, TypeError):
        return 0

def extract_m2(text):
    """Extrae los metros cuadrados del texto"""
    if not text:
        return 0
    try:
        # Buscar patrones como "80 m²", "80m2", etc.
        m2_match = re.search(r'(\d+)\s*(?:m²|m2|metros)', text.lower())
        if m2_match:
            return int(m2_match.group(1))
        return 0
    except (ValueError, TypeError):
        return 0

def process_html_file(filename):
    """Procesa un archivo HTML y extrae la información de las propiedades"""
    try:
        print(f"Procesando archivo {filename}...")
        with open(filename, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        property_cards = soup.select('div[data-qa="posting PROPERTY"]')
        
        properties = []
        for card in property_cards:
            try:
                # Extraer el ID de la propiedad
                property_id = card.get('data-id')
                
                # Extraer el título
                title_element = card.select_one('h3.postingCard-module__posting-description a')
                title = title_element.text.strip() if title_element else ''
                
                # Extraer el precio
                price_element = card.select_one('div[data-qa="POSTING_CARD_PRICE"]')
                price_text = price_element.text.strip() if price_element else ''
                
                # Extraer las expensas
                expenses_element = card.select_one('div[data-qa="expensas"]')
                expenses_text = expenses_element.text.strip() if expenses_element else ''
                
                # Extraer la ubicación
                location_element = card.select_one('h2[data-qa="POSTING_CARD_LOCATION"]')
                location = location_element.text.strip() if location_element else ''
                
                # Extraer las características
                features_element = card.select_one('h3[data-qa="POSTING_CARD_FEATURES"]')
                features_text = features_element.text.strip() if features_element else ''
                
                # Extraer el enlace
                link = title_element.get('href') if title_element else ''
                
                # Extraer información específica
                price, expensas = extract_price(price_text)
                rooms = extract_rooms(features_text)
                m2 = extract_m2(features_text)
                
                property_data = {
                    'price': price,
                    'expensas': expensas,
                    'total': price + expensas,
                    'rooms': rooms,
                    'm2': m2,
                    'location': location,
                    'permalink': link,
                    'id': property_id,
                    'title': title,
                    'source': 'ZonaProp'
                }
                
                print(f"Propiedad encontrada: {title}")
                properties.append(property_data)
                
            except Exception as e:
                print(f"Error procesando tarjeta: {str(e)}")
                continue
        
        return properties
        
    except Exception as e:
        print(f"Error procesando archivo {filename}: {str(e)}")
        return []

def scrape_zonaprop():
    try:
        # Asegurar que existe el directorio para los archivos HTML
        ensure_html_dir()
        
        # URL base de búsqueda
        base_url = "https://www.zonaprop.com.ar/departamentos-ph-alquiler-villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro-mas-de-3-ambientes-300000-1500000-pesos-orden-precio-descendente"
        
        # Descargar las páginas
        html_files = []
        for page in range(1, 11):
            if page == 1:
                url = f"{base_url}.html"
            else:
                url = f"{base_url}-pagina-{page}.html"
            
            filename = download_page(url, page)
            if filename:
                html_files.append(filename)
            time.sleep(2)  # Esperar entre descargas para no sobrecargar el servidor
        
        # Procesar los archivos HTML descargados
        all_properties = []
        for filename in html_files:
            properties = process_html_file(filename)
            all_properties.extend(properties)
        
        # Guardar los datos en un archivo JSON
        with open('zonaPropResults.json', 'w', encoding='utf-8') as f:
            json.dump(all_properties, f, ensure_ascii=False, indent=2)
        
        print(f"\nProceso completado. Se guardaron {len(all_properties)} propiedades en zonaPropResults.json")
        
    except Exception as e:
        print(f"Error durante el scraping: {str(e)}")

if __name__ == "__main__":
    scrape_zonaprop() 