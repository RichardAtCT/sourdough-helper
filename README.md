# Complete Sourdough Helper

A comprehensive web application for all your sourdough baking needs. This consolidated tool brings together recipes, calculators, and interactive features from three separate repositories into one powerful application.

## Overview

This application combines:
- **Sourdough Bread Recipe** - Beginner-friendly step-by-step guide with timers
- **Focaccia Bread Recipe** - Italian flatbread with advanced customization
- **Bulk Fermentation Calculator** - Science-based timing predictions

## Features

### Sourdough Bread Tab
- **Recipe Scaling**: Scale from 0.5x to 4x (250g to 2kg flour)
- **Interactive Timers**: Multiple simultaneous timers with an alarm and browser notifications, which keep running while you use the other tabs
- **Step Tracking**: Check off each step as you complete it
- **Timeline Calculator**: See a suggested timeline based on your start time
- **Baker's Percentages**: Toggle to show professional ratios

### Focaccia Tab
- **Recipe Scaling**: Scale from 0.25x to 4x for any batch size
- **Hydration Control**: Adjust from 78-84% for texture preferences
- **Method Selection**: Choose between commercial yeast or sourdough starter
- **Fermentation Time**: Customize cold fermentation from 12-72 hours
- **Auto-Adjusting Ingredients**: Yeast/starter amounts adjust based on fermentation time
- **Traditional Toppings**: Suggestions for authentic Italian flavor

### Bulk Fermentation Calculator
- **Temperature-Based Predictions**: Estimates based on dough temperature (60-80°F / 15-27°C)
- **Starter Percentage**: Adjustable from 5-30% for different recipes
- **Tested Range**: The data covers 66-74°F (19-23°C) and 5-20% starter; outside that the estimate is extrapolated and flagged with a warning
- **Rise Target Selection**: 75% or 100% (doubled) options
- **Interpolation**: Smooth estimates between the 40 tested data points
- **Completion Time Calculator**: See exactly when your dough will be ready
- **Educational Content**: Learn about fermentation science
- **Data Attribution**: Based on research from The Sourdough Journey

### Shared Features
- **Persistent Preferences**: Settings saved across sessions
- **Temperature Unit Toggle**: Switch between Fahrenheit and Celsius
- **Favorites**: Save and reload named settings on every tab
- **Export / Import**: Back up all settings and progress to a JSON file
- **Mobile Friendly**: Responsive layout and swipe between tabs
- **Works Offline**: Installable as an app (PWA); after the first visit it loads without a connection

## Live Demo

Visit the live application: [Sourdough Helper](https://richardatct.github.io/sourdough-helper/)

## Usage

### For Sourdough Bread
1. Select the "Sourdough Bread" tab
2. Adjust the recipe scale (0.5x to 4x)
3. Optionally set your start time to see a suggested timeline
4. Follow the step-by-step instructions
5. Use the built-in timers for each stage
6. Check off steps as you complete them

### For Focaccia
1. Select the "Focaccia" tab
2. Choose your leavening method (commercial yeast or sourdough starter)
3. Adjust scale, hydration, and fermentation time
4. Follow the instructions with auto-calculated ingredient amounts
5. Add your choice of traditional toppings

### For Fermentation Timing
1. Select the "Bulk Fermentation Calculator" tab
2. Enter your dough temperature
3. Set your starter percentage (typically 10-20%)
4. Choose rise target (75% or 100%)
5. Optionally set start time to see completion time
6. Use the estimate as a guide, but always check dough visually

## Recipes

### Sourdough Bread (Base Recipe at 1x)
- 500g All-purpose flour (100%)
- 105g Active starter (21%)
- 342g Water (68.4%)
- 11g Salt (2.2%)

### Focaccia (Base Recipe at 1x)
- 500g Bread flour (100%)
- 405g Water (81%, adjustable 78-84%)
- 54g Extra virgin olive oil (10.8%)
- 10g Fine sea salt (2%)
- 5g Honey/sugar (1%)
- 4g Instant yeast (0.8%, or 70g sourdough starter)

## Technology

- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **lucide-react** icons
- **vite-plugin-pwa** for offline support and installation
- **Vitest** and **ESLint** for tests and linting
- **localStorage** for persistence; there is no backend

## Consolidation

This application consolidates features from three separate repositories:

1. **sourdough-helper** (original) - Beginner's sourdough bread recipe with timers
2. **Sourdough** (focaccia-based) - Focaccia recipe with hydration and method controls
3. **SourdoughR** - Bulk fermentation calculator with scientific predictions

All features have been unified with:
- Consistent styling and user experience
- Shared state management for preferences
- Responsive design across all components

## Local Development

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:5173/sourdough-helper/
npm test         # unit tests
npm run lint     # ESLint
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Pushes to `main` are tested, built and deployed to GitHub Pages automatically.

## Contributing

Contributions are welcome! This project aims to help bakers of all skill levels make better sourdough.

## Credits

- Bulk fermentation calculator data based on research from **The Sourdough Journey**
- Fermentation timing interpolates the empirical test data (see `src/utils/calculations.js`)

## License

MIT
