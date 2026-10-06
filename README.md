# Casa La Piedad Residences

Conceptual vision website for Casa La Piedad Residences, Isla Verde, Puerto Rico.

*Inspired Living. Personalized Care.*

## Structure

- `index.html`: English page (source of truth)
- `es/index.html`: Spanish page, generated from `index.html` with `python3 tools/build-es.py` using the strings in `tools/es.json`. Edit the English page and the JSON, then rebuild; do not edit `es/index.html` by hand.
- `styles.css`, `main.js`: styling, opening fade, music, scroll effects, horizontal gallery, lightbox
- `assets/img/`: conceptual architectural images. `aerial` and `form` are stills from the film's opening shot, and `establishing` is its source image; the others were generated with the film's frames as reference
- `assets/video/flyover.mp4`: opening film, about 58 s: the residence and church seen from Laguna Los Corozos, the rooftop terrace, the shared garden, the wellness studio, the wellness bar, the pool, the restaurant, the salon and barbershop, the screening room and the sports garden with its centered courts and putting greens (the still `aerial.jpg` is the fallback). The logo holds over most of the film and fades out slowly.
- `assets/video/clips/`: minimal-motion loops (Kling 3.0 4K, first frame = last frame, 720p web encode) that replace every photo on the page; each keeps its photo in `assets/img/` as poster, loads only near the viewport and plays only while visible. Visitors who prefer reduced motion see the photos.
- `assets/audio/ambient.mp3`: original instrumental background music (ElevenLabs). It starts with the film, from the first note. Browsers (iOS and Android included) block audible autoplay until the visitor's first touch, click or key press; when that happens the film plays muted and that first gesture restarts the film and the music together. The Sound button toggles it.
- `assets/brand/`: logo files and favicon

## Logo

`assets/brand/logo.png` is the official Casa La Piedad Residences logo, used as supplied with its white background made transparent. On the film it sits over a soft, diffuse ivory glow (no box) so its colors stay legible. `favicon.png` and `apple-touch-icon.png` are crops of the logo mark.

## Hosting

Static site, no build step. Deployed on Vercel, linked to this repository: every push to `main` publishes to production.
Domains: casalapiedad.com (primary), casalapiedad.net and casalapiedad.org (redirect to .com).

## Note

All imagery is conceptual and depicts proposed architecture, not an existing, approved or permitted development.
Architectural inspiration: Casa La Piedad by Cotaparedes Arquitectos.
