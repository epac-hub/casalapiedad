#!/usr/bin/env python3
"""Generate es/index.html from index.html.

index.html (English) is the source of truth. Edit it, update tools/es.json
if text changed, then run:  python3 tools/build-es.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / 'index.html').read_text(encoding='utf-8')
es = json.loads((ROOT / 'tools' / 'es.json').read_text(encoding='utf-8'))
html = src


def swap(old, new, count=1):
    global html
    found = html.count(old)
    if found != count:
        raise SystemExit(f'Expected {count} match(es), found {found}: {old[:70]!r}')
    html = html.replace(old, new)


# Text inside elements marked data-i18n="key".
for key, text in es.items():
    pattern = re.compile(r'(<(\w+)\b[^>]*\bdata-i18n="' + re.escape(key) + r'"[^>]*>)(.*?)(</\2>)', re.S)
    html, n = pattern.subn(lambda m: m.group(1) + text + m.group(4), html)
    pattern_cap = re.compile(r'(data-i18n-cap="' + re.escape(key) + r'" data-caption=")[^"]*(")')
    html, n_cap = pattern_cap.subn(lambda m: m.group(1) + text + m.group(2), html)
    pattern_aria = re.compile(r'(data-i18n-aria="' + re.escape(key) + r'" aria-label=")[^"]*(")')
    html, n_aria = pattern_aria.subn(lambda m: m.group(1) + text + m.group(2), html)
    if n + n_cap + n_aria == 0:
        raise SystemExit(f'Key not found in index.html: {key}')

# Document language, metadata and links.
swap('<html lang="en">', '<html lang="es">')
swap('<title>Casa La Piedad Residences · Isla Verde</title>',
     '<title>Casa La Piedad Residences · Isla Verde, Puerto Rico</title>')
swap('content="A conceptual vision for Casa La Piedad Residences in Isla Verde, Puerto Rico. Inspired Living. Personalized Care."',
     'content="Visión conceptual de Casa La Piedad Residences en Isla Verde, Puerto Rico. Inspired Living. Personalized Care."')
swap('content="Inspired Living. Personalized Care. A conceptual vision in Isla Verde, Puerto Rico."',
     'content="Inspired Living. Personalized Care. Una visión conceptual en Isla Verde, Puerto Rico."')
swap('<link rel="canonical" href="https://casalapiedad.com/">', '<link rel="canonical" href="https://casalapiedad.com/es/">')
swap('<meta property="og:url" content="https://casalapiedad.com/">', '<meta property="og:url" content="https://casalapiedad.com/es/">')
swap('<meta property="og:locale" content="en_US">\n  <meta property="og:locale:alternate" content="es_PR">',
     '<meta property="og:locale" content="es_PR">\n  <meta property="og:locale:alternate" content="en_US">')
swap('<a href="/es/" hreflang="es" lang="es" data-lang="es">ES</a>',
     '<a href="/es/" hreflang="es" lang="es" data-lang="es" aria-current="true">ES</a>', 2)
swap('<a href="/" hreflang="en" lang="en" data-lang="en" aria-current="true">EN</a>',
     '<a href="/" hreflang="en" lang="en" data-lang="en">EN</a>', 2)
swap('aria-label="Sections"', 'aria-label="Secciones"')
swap('aria-label="Image viewer"', 'aria-label="Visor de imágenes"')
swap('aria-label="Close"', 'aria-label="Cerrar"')

# Image descriptions.
alts = {
    'Conceptual view from Laguna Los Corozos across the residence campus toward Calle Marginal and the ocean':
        'Vista conceptual desde la Laguna Los Corozos sobre el conjunto residencial hacia la Calle Marginal y el mar',
    'Conceptual view from Calle Marginal of the residence campus, with the church and Laguna Los Corozos behind':
        'Vista conceptual desde la Calle Marginal del conjunto residencial, con la iglesia y la Laguna Los Corozos detrás',
    'Conceptual arrival portal with a wooden door, reflecting pool and tropical planting':
        'Pórtico de llegada conceptual con puerta de madera, espejo de agua y vegetación tropical',
    'Conceptual courtyard with palms, reflecting pool and curved balconies':
        'Patio conceptual con palmas, espejo de agua y balcones curvos',
    'Conceptual light-filled gallery overlooking the courtyard':
        'Galería conceptual llena de luz con vista al patio',
    'Conceptual double-height living room opening to the courtyard':
        'Sala conceptual de doble altura abierta al patio',
    'Conceptual rooftop garden terrace at sunset': 'Terraza jardín conceptual en la azotea al atardecer',
    'Conceptual detail of a curved white balcony with wood screen': 'Detalle conceptual de un balcón blanco curvo con celosía de madera',
    'Conceptual light-filled private residence': 'Residencia privada conceptual llena de luz',
    'Conceptual communal living room': 'Sala común conceptual',
    'Conceptual low aerial view toward the entrance': 'Vista aérea baja conceptual hacia la entrada',
    'Conceptual courtyard garden': 'Jardín del patio conceptual',
    'Conceptual shared garden with a teak pergola where residents gather at a long table':
        'Jardín compartido conceptual con pérgola de teca donde los residentes se reúnen en una mesa larga',
    'Conceptual light-filled wellness studio opening onto the garden':
        'Estudio de bienestar conceptual lleno de luz y abierto al jardín',
    'Conceptual wellness pavilion with an outdoor terrace for gentle exercise':
        'Pabellón de bienestar conceptual con terraza exterior para ejercicio suave',
    'Conceptual aerial view of the garden and wellness pavilion beside the residences':
        'Vista aérea conceptual del jardín y el pabellón de bienestar junto a las residencias',
    'Conceptual pool terrace framed by the residences, away from the beach':
        'Terraza de piscina conceptual enmarcada por las residencias, lejos de la playa',
    'Conceptual garden restaurant with residents dining at golden hour':
        'Restaurante conceptual en el jardín con residentes cenando al atardecer',
    'Conceptual pickleball and tennis courts set inland among palms':
        'Canchas conceptuales de pickleball y tenis tierra adentro, entre palmas',
}
for en_alt, es_alt in alts.items():
    swap(f'alt="{en_alt}"', f'alt="{es_alt}"')

out = ROOT / 'es' / 'index.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'Wrote {out.relative_to(ROOT)}')
