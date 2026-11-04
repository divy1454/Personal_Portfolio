# Divy Patel, frontend developer

My portfolio: https://divy1454.github.io/Personal_Portfolio

A light blue page with a clay 3D stage. On load the cursor clicks a clay D and the rest of DIVY rises out of the stage. Every section after that has its own clay object that animates as you scroll: a map pin for About, code brackets for Skills, a kanban board where leads move through the pipeline for Experience, and one object per project.

## Stack

- React 18 (Create React App)
- Three.js for the clay stage (`src/scene/clayScene.js`)
- EmailJS for the contact form
- Instrument Sans and Instrument Serif, self-hosted through Fontsource

## Run it

```bash
npm install
npm start        # http://localhost:3000/Personal_Portfolio
npm run build    # production build in build/
```

## How the 3D follows the page

Each section has `data-chapter` (which clay object to show) and `data-side` (which side of the copy it sits on). `ClayStage` starts the scene once the page has rendered; the scene reads those sections, maps the scroll position to them and swaps the objects. Phones get the stage as a band at the top. `prefers-reduced-motion` skips the intro and idle motion.

Open the site with `?debug` to get `window.__clay.pose({ s, intro, time })`, which freezes the scene at any scroll position for screenshots.

## Contact form

The form sends through EmailJS to divy9954@gmail.com. The IDs live at the top of `src/components/Contact.js`. The EmailJS template uses these variables:

- `{{from_name}}`
- `{{from_email}}`
- `{{message}}`
- `{{reply_to}}` (same as the sender's email, for the template's Reply-To field)

If a message fails, the visitor sees the email address to write to, and the browser console logs the reason EmailJS gave. The usual fixes are in the EmailJS dashboard: reconnect the Gmail service if it reports an invalid grant, and make sure `divy1454.github.io` is allowed if domain restrictions are on.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to the `Deployment` branch for GitHub Pages.
