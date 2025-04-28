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

# Lista de barrios a filtrar con sus variaciones
BARRIOS_FILTER = {
    "Villa Urquiza": ["villa urquiza", "urquiza"],
    "Villa Devoto": ["villa devoto", "devoto"],
    "Villa Del Parque": ["villa del parque", "villa del parque", "del parque"],
    "Villa Pueyrredon": ["villa pueyrredon", "pueyrredon"]
}

# Configuración de filtros
FILTERS = {
    "barrios": True,  # Activar/desactivar filtro de barrios
    "venta": False,   # Solo alquiler
    "alquiler": True  # Mostrar propiedades en alquiler
}

# URLs de las páginas a descargar
PAGES = [
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-2',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-3',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-4',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-5',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-6',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-7',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-8',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-9',
    'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes/pagina-10'
]

# Headers para simular un navegador
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
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

def normalize_text(text):
    """Normaliza texto para comparación"""
    if not text:
        return ""
    return text.lower().strip()

def extract_barrio(location):
    """Extrae el barrio de la ubicación"""
    normalized_location = normalize_text(location)
    for barrio, variaciones in BARRIOS_FILTER.items():
        if any(normalize_text(variacion) in normalized_location for variacion in variaciones):
            return barrio
    return "Otro"

def extract_tipo(url):
    """Determina el tipo de operación (venta/alquiler)"""
    if '/alquiler/' in url:
        return 'Alquiler'
    if '/venta/' in url:
        return 'Venta'
    return 'Otro'

def extract_property_type(title):
    """Determina el tipo de propiedad (PH/Departamento)"""
    if not title:
        return 'Departamento'
    return 'PH' if 'ph' in title.lower() else 'Departamento'

def download_page(url, page_number):
    """Descarga una página y la guarda en un archivo"""
    filename = f"{HTML_DIR}/argenprop{page_number}.html"
    
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
    cards = soup.select('.listing__item')
    
    for card in cards:
        try:
            # Extraer precio y expensas
            price_text = card.select_one('.card__price').text if card.select_one('.card__price') else ''
            expensas_text = card.select_one('.card__expenses').text if card.select_one('.card__expenses') else ''
            
            # Extraer características
            features = card.select('.card__main-features li')
            rooms = 0
            m2 = 0
            for feature in features:
                text = feature.text.lower()
                if 'dorm' in text:
                    rooms = extract_number(text) + 1
                elif 'm²' in text:
                    m2 = extract_number(text)
            
            # Extraer ubicación y título
            location = card.select_one('.card__address').text.strip() if card.select_one('.card__address') else ''
            title = card.select_one('.card__title--primary').text.strip() if card.select_one('.card__title--primary') else ''
            
            # Extraer link e ID
            link = card.select_one('a')
            permalink = f"https://www.argenprop.com{link['href']}" if link else ''
            property_id = link.get('data-item-card', '') if link else ''
            
            # Calcular total
            price = extract_number(price_text)
            expensas = extract_number(expensas_text)
            total = price + expensas
            
            # Determinar barrio y tipo
            barrio = extract_barrio(location)
            tipo = extract_tipo(url)
            property_type = extract_property_type(title)
            
            properties.append({
                'price': price,
                'expensas': expensas,
                'total': total,
                'rooms': rooms,
                'm2': m2,
                'location': location,
                'barrio': barrio,
                'tipo': tipo,
                'propertyType': property_type,
                'permalink': permalink,
                'id': property_id,
                'title': title[:50]  # Limitar el título a 50 caracteres
            })
        except Exception as e:
            print(f"Error al extraer datos de una propiedad: {str(e)}")
            continue
    
    return properties

def main():
    print("Iniciando búsqueda de propiedades en ArgenProp...")
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
            with open(f"{HTML_DIR}/argenprop{i}.html", 'r', encoding='utf-8') as f:
                html = f.read()
            
            soup = BeautifulSoup(html, 'html.parser')
            properties = extract_property_data(soup, url)
            all_properties.extend(properties)
            
            print(f"Página {i}: Encontradas {len(properties)} propiedades")
            
        except Exception as e:
            print(f"Error al procesar página {i}: {str(e)}")
            continue
    
    # Aplicar filtros
    filtered_properties = []
    for prop in all_properties:
        # Filtrar por tipo de operación
        if (FILTERS['venta'] and prop['tipo'] == 'Venta') or \
           (FILTERS['alquiler'] and prop['tipo'] == 'Alquiler'):
            # Filtrar por barrios si está activado
            if not FILTERS['barrios'] or prop['barrio'] in BARRIOS_FILTER:
                filtered_properties.append(prop)
    
    # Filtrar propiedades nuevas
    new_properties = [
        prop for prop in filtered_properties
        if not any(existing['id'] == prop['id'] for existing in last_results)
    ]
    
    # Combinar resultados
    updated_results = last_results + new_properties
    
    # Guardar resultados
    save_results(updated_results)
    
    # Mostrar estadísticas
    print("\nEstadísticas:")
    print(f"Total de propiedades encontradas: {len(all_properties)}")
    print(f"Propiedades después de filtrar: {len(filtered_properties)}")
    print(f"Propiedades nuevas: {len(new_properties)}")
    print(f"Total de propiedades guardadas: {len(updated_results)}")
    
    # Estadísticas por tipo y barrio
    tipos = {}
    barrios = {}
    for prop in new_properties:
        tipos[prop['tipo']] = tipos.get(prop['tipo'], 0) + 1
        barrios[prop['barrio']] = barrios.get(prop['barrio'], 0) + 1
    
    print("\nPropiedades nuevas por tipo:")
    for tipo, count in tipos.items():
        print(f"  {tipo}: {count}")
    
    print("\nPropiedades nuevas por barrio:")
    for barrio, count in barrios.items():
        print(f"  {barrio}: {count}")

if __name__ == "__main__":
    main() 