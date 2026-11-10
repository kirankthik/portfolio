# A career, twice

A résumé with two views of the same career, switched with the toggle next to the name:

- **Résumé**: a spare professional page. Text lives in [`data/resume.js`](data/resume.js).
- **Islands**: an explorable 3D map. Text, positions and colours live in [`data/world.js`](data/world.js).

Plain static files, no build step. Nothing is loaded but code and two fonts: every model is generated at runtime.

## Run it

```
python3 -m http.server 8000     # then open http://localhost:8000
```

## Put it online

Repository **Settings → Pages → Deploy from a branch**, pick the branch and `/ (root)`.

## How the islands view works

| Piece | Where |
| --- | --- |
| Island and landmark models | `js/islands.js` (`LANDMARKS`) |
| Sky shader, time of day, camera, timeline, tour | `js/main.js` |
| Résumé page, line-drawn map, view switching, badge | `js/app.js` |

- **The sky keeps time.** Each island has an `era` from 0 (night) to 1 (morning). The sky, sun, lamps and
  fireflies follow the era of wherever you are.
- **Quality adapts.** Bloom and tilt-shift run at full quality and switch off automatically if frames are slow.
  Force a level with `?q=0`, `?q=1` or `?q=2`. Skip the opening with `?nointro`.
- **Links.** `?v=map` opens the islands; `?v=map#<island-id>` opens one island.

## Add a creation

1. Make a folder `creations/<slug>/` with its own `index.html`. It is a separate page, so it can
   look and behave however it likes. Link back with `../../?v=map#<slug>`.
2. Add an island to `data/world.js` with `kind: 'creation'`, a `palette`, a `landmark`, an `era` and
   `href: 'creations/<slug>/'`. The `plot-1` island is a placeholder to replace.
3. Add a path from `tailwind` to it with `style: 'light'`, and add its id to `tour`.
4. For a custom model on the island, add a function to `LANDMARKS` in
   [`js/islands.js`](js/islands.js) and use its name as the `landmark`.
5. Add a card for it under `projects` in `data/resume.js`.

Three.js (MIT) is vendored in `vendor/`; Fraunces and Inter (SIL OFL) in `fonts/`.
