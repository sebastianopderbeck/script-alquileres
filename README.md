# Script de Búsqueda de Propiedades

Este proyecto contiene scripts para buscar propiedades en diferentes portales inmobiliarios.

## Configuración de URLs

### ZonaProp
Para modificar la búsqueda en ZonaProp, edita la variable `BASE_URL` en `scriptZonaProp.py`:

```python
BASE_URL = 'https://www.zonaprop.com.ar/departamentos-ph-alquiler-villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro-mas-de-3-ambientes.html'
```

La URL debe seguir este formato:
- Tipo de propiedad: `departamentos-ph`
- Operación: `alquiler`
- Barrios: `villa-urquiza-villa-pueyrredon-villa-devoto-monte-castro`
- Ambientes: `mas-de-3-ambientes`

### ArgenProp
Para modificar la búsqueda en ArgenProp, edita la variable `BASE_URL` en `scriptArgenProp.py`:

```python
BASE_URL = 'https://www.argenprop.com/departamentos-o-ph/alquiler/villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza/3-ambientes-o-4-ambientes'
```

La URL debe seguir este formato:
- Tipo de propiedad: `departamentos-o-ph`
- Operación: `alquiler`
- Barrios: `villa-del-parque-o-villa-devoto-o-villa-pueyrredon-o-villa-urquiza`
- Ambientes: `3-ambientes-o-4-ambientes`

## Instalación

1. Instala las dependencias:
```bash
pip install requests beautifulsoup4
```

2. Ejecuta los scripts:
```bash
python scriptZonaProp.py
python scriptArgenProp.py
```

## Estructura del Proyecto

- `scriptZonaProp.py`: Script para buscar propiedades en ZonaProp
- `scriptArgenProp.py`: Script para buscar propiedades en ArgenProp
- `htmls/`: Directorio donde se guardan las páginas HTML descargadas
- `zonaPropResults.json`: Resultados de ZonaProp
- `argenPropResults.json`: Resultados de ArgenProp

## Notas

- Los scripts guardan las páginas HTML en el directorio `htmls/` para evitar descargas repetidas
- Los resultados se guardan en archivos JSON separados
- Se recomienda esperar entre 2-3 segundos entre solicitudes para no sobrecargar los servidores