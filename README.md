# Sleek

Sleek is the UI library powering [Toph](https://toph.co/) and related products. It provides stylesheets (SCSS) and interactive JavaScript widgets that implement Toph's look and feel.

## Overview

- **SCSS components** — base utilities, content components, layout modules, and widget styles
- **JavaScript widgets** — interactive components (Dropdown, Modal, sticky table headers)
- **Theme support** — light and dark themes with CSS custom properties
- **Modular** — import only what you need, per component

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
| `dropdown` | Select dropdown with search, multi-select, and HTTP backend support |
| `modal` | Dialog with animations, backdrop, and keyboard support |
| `theadfly` | Sticky table headers that follow the scroll position |
| `bellmenu` | Notification bell menu |
| `breadcrumb` | Breadcrumb navigation |
| `faq` | FAQ accordion |
| `flair` | Badge and flair components |
| `handle` | Drag handle indicator |
| `highlight` | Text highlighting |
| `icon` | Icon styling |
| `occlude` | Show/hide utility |
| `pagination` | Pagination navigation |
| `pills` | Pill and tag components |
| `strips` | Strip and banner components |
| `switch` | Toggle switch |
| `tabs` | Tab navigation |
| `animate` | Animation utilities |

### Layouts

| Layout | Description |
|---|---|
| `site` | Main site layout with navbar |
| `arena` | Arena layout |
| `kiosk` | Kiosk layout |
| `splash` | Splash page layout |

### Themes

| Theme | File |
|---|---|
| Light (default) | `scss/themes/light.scss` |
| Dark | `scss/themes/dark.scss` |

## Development

Install dependencies:

```sh
npm install
```

Build CSS and JavaScript:

```sh
npm run build
```

Build only CSS or only JavaScript:

```sh
npm run build-css
npm run build-js
```

To run the demo locally:

```sh
npx serve
```

Then navigate to [http://localhost:3000/demo](http://localhost:3000/demo).

## Output

The compiled files are written to `dist/`:

```
dist/
├── css/
│   ├── sleek.css          # Main stylesheet
│   ├── themes/            # Light and dark themes
│   ├── layouts/           # Layout stylesheets
│   └── widgets/           # Widget stylesheets
└── js/
    └── sleek.js           # Bundled JavaScript (ESM)
```

## Stack

- **SCSS** — stylesheets with modular imports
- **Rollup + Babel** — JavaScript bundling and transpilation
- **Autoprefixer** — CSS vendor prefix automation
- **Cypress** — end-to-end tests
