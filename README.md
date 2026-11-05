# Divy Patel, frontend developer

My portfolio: a single page in clay. One Three.js stage sits behind the page and carries a different clay object for every section as you scroll: the D that turns into DIVY on load, a laptop that opens for the about section, the tech stack fanning apart, a kanban board, a dashboard monitor, the JDMatcher window, the TexPort phone, a shelf that fills with boxes, and an envelope that turns into a paper plane.

Live at https://divy1454.github.io/Personal_Portfolio

## How it is built

- React 18 with Create React App (`react-scripts`).
- `src/scene/clayScene.js` holds the whole 3D stage (Three.js). Every section with a `data-chapter` attribute gets a clay object; the stage reads the page layout to frame each one beside its copy on desktop, and pins it behind the copy on phones.
- `src/styles/index.css` is the design: tokens at the top, then the page in reading order. Fonts are Fraunces (headlines) and Instrument Sans, self-hosted through Fontsource.
- The contact form sends through EmailJS (`src/components/Contact.js`).

## Working on it

```bash
npm install
npm start        # http://localhost:3000
npm run build    # production build in build/
```

Open the page with `?debug` to get `window.__clay.pose({ s })`, which poses the stage at any scroll position for screenshots.

## Deploying

Every push to `main` builds the site and publishes `build/` to the `Deployment` branch (`.github/workflows/deploy.yml`), which GitHub Pages serves. `npm run deploy` does the same from a laptop.
