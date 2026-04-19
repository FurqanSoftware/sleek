# Sleek

Sleek is the UI library powering [Toph](https://toph.co/) and related products. It provides stylesheets (SCSS) and interactive JavaScript widgets that implement Toph's look and feel.

Live showcase: [furqansoftware.github.io/sleek](https://furqansoftware.github.io/sleek/) (built from `site/`).

## Overview

- **SCSS components** — base utilities, content components, layout modules, and widget styles
- **JavaScript widgets** — interactive components (Dropdown, Modal)
- **Theme support** — light and dark themes with CSS custom properties
- **Modular** — import only what you need, per component

## Philosophy

Sleek separates concerns across three layers, and each layer uses the selector that matches its purpose:

- **HTML → semantic elements + ARIA.** Use `<fieldset>`, `<label>`, `<button>`, and the right `role` for what an element *is*. Accessibility is a prerequisite, not an afterthought.
- **CSS → BEM classes for appearance, ARIA attributes for state.** Style visual variants through classes like `.form__field` and `.panel.-modest`, never bare element selectors. For state that has an accessibility meaning — open/closed, selected, invalid, pressed, expanded — key CSS off the ARIA attribute (`[aria-expanded="false"]`, `[aria-invalid="true"]`, `[hidden]`) so the ARIA is the single source of truth. Purely visual state with no accessibility equivalent (`-loading`, `-compact`) stays as BEM modifiers. *Exception:* content containers for arbitrary HTML (e.g., `.artifact` for rendered Markdown/CMS output) may scope bare element selectors inside them — you can't BEM markup you don't control, so scoped element selectors are the appropriate tool.
- **JS behavior → ARIA roles.** Keyboard navigation and interactive behavior query by `[role="option"]`, `[role="menuitem"]`, etc. — not by CSS class. This couples behavior to meaning rather than appearance, and makes accessible markup a prerequisite for features to work.

The practical upshot: a widget's markup must be semantically correct for its JS to work *and* for its state to render correctly. Styling variants stay isolated through classes, and renaming a class never silently breaks behavior or accessibility.

## Usage

### CSS

Import the full stylesheet:

```scss
@use 'sleek';
```

Or import individual components:

```scss
@use 'sleek/widgets/dropdown';
@use 'sleek/widgets/dropdown/dark'; // dark theme variant
```

### JavaScript

Import individual widgets:

```js
import Dropdown from 'sleek/widgets/dropdown';
import Modal from 'sleek/widgets/modal';
```

Or import everything:

```js
import * as Sleek from 'sleek';
```

## Components

### Widgets

| Widget | Description |
|---|---|
| `dropdown` | Select dropdown with search, multi-select, HTTP backend support, keyboard navigation |
| `modal` | Dialog with animations, backdrop, focus trap, and keyboard support |
| `bellmenu` | Notification bell menu |
| `breadcrumb` | Breadcrumb navigation |
| `faq` | FAQ accordion |
| `flair` | Inline metadata groups (stats, counts, row-hover actions) |
| `handle` | User handles / display names |
| `highlight` | Content highlight blocks |
| `icon` | Icon container (mask-image + `currentColor` for inheritable tinting) |
| `occlude` | Visibility/occlusion utility |
| `pagination` | Page navigation |
| `pills` | Pill and tag components |
| `strips` | Strip and banner components |
| `switch` | Toggle switch (ARIA `role="switch"`) |
| `tabs` | Tab navigation |
| `animate` | Animation utilities (wraps `animate.css` plus custom keyframes used by Dropdown/Modal) |

### Layouts

| Layout | Description |
|---|---|
| `site` | Main site layout with primary navigation |
| `arena` | Arena layout |
| `kiosk` | Kiosk layout |
| `splash` | Splash page layout |

### Themes

| Theme | File |
|---|---|
| Light (default) | `scss/themes/light.scss` |
| Dark | `scss/themes/dark.scss` |

## Development

Install dependencies (at repo root — uses npm workspaces to cover both sleek and `site/`):

```sh
npm install
```

Build sleek's CSS and JS:

```sh
npm run build              # both
npm run build:css          # CSS only
npm run build:js           # JS only
```

Work on the showcase site (Astro):

```sh
npm run site:dev           # dev server with live reload
npm run site:build         # static build to site/dist/
npm run site:preview       # preview the built site
```

The site consumes sleek's SCSS and JS directly from the sibling directories — edits to `scss/` or `js/` trigger live reload in `site:dev`.

## Output

```
dist/
├── css/
│   ├── sleek.css          # Main stylesheet
│   ├── themes/            # Light and dark themes
│   ├── layouts/           # Layout stylesheets
│   └── widgets/           # Widget stylesheets
└── js/
    └── sleek.js           # Bundled JavaScript (ESM)

site/dist/                 # Static showcase site, deployed to GitHub Pages
```

## Stack

- **SCSS** — stylesheets with modular imports
- **Rollup + Babel** — JavaScript bundling and transpilation
- **Autoprefixer** — CSS vendor prefix automation
- **Astro + MDX** — the showcase site in `site/`
- **Cypress** — end-to-end tests
