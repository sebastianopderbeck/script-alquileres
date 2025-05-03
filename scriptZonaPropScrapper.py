from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import json
import re

def extract_price(text):
    # Extraer el precio y expensas del texto
    price = 0
    expensas = 0
    
    # Buscar el precio principal
    price_match = re.search(r'\$([\d\.]+)', text)
    if price_match:
        price = int(price_match.group(1).replace('.', ''))
    
    # Buscar expensas
    expensas_match = re.search(r'Expensas:\s*\$([\d\.]+)', text)
    if expensas_match:
        expensas = int(expensas_match.group(1).replace('.', ''))
    
    return price, expensas

def extract_rooms(text):
    # Extraer la cantidad de ambientes
    rooms_match = re.search(r'(\d+)\s*amb', text.lower())
    if rooms_match:
        return int(rooms_match.group(1))
    return 0

def extract_m2(text):
    # Extraer los metros cuadrados
    m2_match = re.search(r'(\d+)\s*m²', text.lower())
    if m2_match:
        return int(m2_match.group(1))
    return 0

def extract_id(url):
    # Extraer el ID de la URL
    id_match = re.search(r'-(\d+)(?:\.html)?$', url)
    if id_match:
        return id_match.group(1)
    return None

def scrape_zonaprop():
    try:
        # Configurar Chrome para modo headless
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Agregar headers más realistas
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        chrome_options.add_argument('--accept-language=es-AR,es;q=0.9,en;q=0.8')
        chrome_options.add_argument('--accept=text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8')
        chrome_options.add_argument('--sec-ch-ua="Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"')
        chrome_options.add_argument('--sec-ch-ua-mobile=?0')
        chrome_options.add_argument('--sec-ch-ua-platform="macOS"')

        # Inicializar el driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # URL de búsqueda
        url = "https://www.zonaprop.com.ar/departamentos-ph-alquiler-villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro-mas-de-3-ambientes.html"
        
        print("Navegando a la URL...")
        driver.get(url)
        
        # Esperar a que la página cargue completamente
        print("Esperando a que la página cargue...")
        time.sleep(10)  # Aumentar el tiempo de espera
        
        # Imprimir el HTML de la página para debugging
        print("Longitud del HTML:", len(driver.page_source))
        
        # Intentar diferentes selectores para encontrar las tarjetas
        selectors = [
            'div[data-qa="posting-card"]',
            'div.posting-card',
            'div[class*="posting-card"]',
            'div[class*="posting"]',
            'div[class*="card"]',
            'div[class*="property"]'
        ]
        
        property_cards = []
        for selector in selectors:
            print(f"Intentando con selector: {selector}")
            cards = driver.find_elements(By.CSS_SELECTOR, selector)
            print(f"Encontradas {len(cards)} tarjetas con este selector")
            if cards:
                property_cards = cards
                break
        
        if not property_cards:
            print("No se encontraron tarjetas de propiedades")
            return
        
        print(f"Total de tarjetas encontradas: {len(property_cards)}")
        
        properties = []
        for card in property_cards:
            try:
                print("Procesando tarjeta...")
                
                # Intentar diferentes selectores para el título
                title_selectors = [
                    'h2[data-qa="posting-title"]',
                    'h2.posting-title',
                    'h2[class*="title"]',
                    'h2[class*="heading"]',
                    'h2',
                    'h3[class*="title"]',
                    'h3[class*="heading"]',
                    'h3'
                ]
                
                title = None
                for selector in title_selectors:
                    try:
                        title_element = card.find_element(By.CSS_SELECTOR, selector)
                        title = title_element.text.strip()
                        if title:
                            break
                    except:
                        continue
                
                if not title:
                    print("No se pudo encontrar el título")
                    continue
                
                # Intentar diferentes selectores para el precio
                price_selectors = [
                    'div[data-qa="posting-price"]',
                    'div[class*="price"]',
                    'div[class*="amount"]',
                    'span[class*="price"]',
                    'span[class*="amount"]'
                ]
                
                price_text = None
                for selector in price_selectors:
                    try:
                        price_element = card.find_element(By.CSS_SELECTOR, selector)
                        price_text = price_element.text.strip()
                        if price_text:
                            break
                    except:
                        continue
                
                # Intentar diferentes selectores para la ubicación
                location_selectors = [
                    'div[data-qa="posting-location"]',
                    'div[class*="location"]',
                    'div[class*="address"]',
                    'span[class*="location"]',
                    'span[class*="address"]'
                ]
                
                location = None
                for selector in location_selectors:
                    try:
                        location_element = card.find_element(By.CSS_SELECTOR, selector)
                        location = location_element.text.strip()
                        if location:
                            break
                    except:
                        continue
                
                # Intentar diferentes selectores para las características
                features_selectors = [
                    'div[data-qa="posting-features"]',
                    'div[class*="features"]',
                    'div[class*="amenities"]',
                    'ul[class*="features"]',
                    'ul[class*="amenities"]'
                ]
                
                features_text = ""
                for selector in features_selectors:
                    try:
                        features_elements = card.find_elements(By.CSS_SELECTOR, selector)
                        for element in features_elements:
                            features_text += element.text.strip() + " "
                        if features_text:
                            break
                    except:
                        continue
                
                # Intentar diferentes selectores para el enlace
                link_selectors = [
                    'a[data-qa="posting-link"]',
                    'a[class*="link"]',
                    'a[class*="card"]',
                    'a'
                ]
                
                link = None
                for selector in link_selectors:
                    try:
                        link_element = card.find_element(By.CSS_SELECTOR, selector)
                        link = link_element.get_attribute('href')
                        if link:
                            break
                    except:
                        continue
                
                # Extraer información específica
                price, expensas = extract_price(price_text)
                rooms = extract_rooms(features_text)
                m2 = extract_m2(features_text)
                id = extract_id(link)
                
                property_data = {
                    'price': price,
                    'expensas': expensas,
                    'total': price + expensas,
                    'rooms': rooms,
                    'm2': m2,
                    'location': location,
                    'permalink': link,
                    'id': id,
                    'title': title,
                    'source': 'ZonaProp'
                }
                
                print(f"Propiedad encontrada: {title}")
                properties.append(property_data)
                
            except Exception as e:
                print(f"Error procesando tarjeta: {str(e)}")
                continue
        
        # Guardar los datos en un archivo JSON
        with open('zonaPropResults.json', 'w', encoding='utf-8') as f:
            json.dump(properties, f, ensure_ascii=False, indent=2)
        
        print(f"Se guardaron {len(properties)} propiedades en zonaPropResults.json")
        
    except Exception as e:
        print(f"Error durante el scraping: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    scrape_zonaprop() 