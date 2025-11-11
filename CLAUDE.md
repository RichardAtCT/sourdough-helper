# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page React application for helping beginners make sourdough bread. The entire application is contained in `index.html` as a self-contained HTML file with embedded React code using Babel standalone.

## Technology Stack

- **React 18**: Loaded via UMD from unpkg.com
- **Babel Standalone**: For JSX transpilation in the browser
- **Tailwind CSS**: Loaded via CDN for styling
- **Lucide Icons**: Icon library loaded via UMD

## Architecture

The application is built as a single React component (`SourdoughHelper`) with the following key features:

1. **Recipe Scaling**: Base recipe for 500g flour that can be scaled from 0.5x to 3x
2. **Baker's Percentages**: Toggle to show/hide baker's percentages (flour = 100%)
3. **Interactive Timers**: Multiple simultaneous timers for different stages of bread making
4. **Step Tracking**: Checkboxes to track completion of each step
5. **Timeline Calculator**: Generates suggested timeline based on user-provided start time

### State Management

All state is managed locally using React hooks:
- `scale`: Recipe scaling multiplier (0.5-3)
- `showBakersPercent`: Toggle for showing baker's percentages
- `activeTimers`: Object tracking all active timers by ID
- `completedSteps`: Object tracking completed steps by ID
- `startTime`: User-provided start time for timeline calculation

### Base Recipe

The base recipe (scaled to 500g flour):
- Flour: 500g (100%)
- Active starter: 105g (21%)
- Water: 342g (68.4%)
- Salt: 11g (2.2%)

## Development

### Running the Application

Simply open `index.html` in a web browser. No build process or server is required.

### Testing Changes

Refresh the browser after making edits to `index.html`.

### Key Components

- **TimerDisplay**: Reusable timer component with start/stop functionality
- **calculateTimeline**: Function that generates time-based schedule from start time
- **Icon Components**: Wrapper functions for Lucide icons with `lucide.createIcons()` initialization

## Code Structure

The React code is embedded in a `<script type="text/babel">` tag starting at line 27. The component renders:

1. Header and description
2. Controls (scale slider, start time picker, baker's percentage toggle)
3. Ingredients list with calculated amounts
4. Optional timeline (when start time is set)
5. Process steps organized by phase (Preparation, Mixing & Autolyse, Stretch and Folds, Bulk Fermentation, Shaping, Baking)
6. Pro tips section

## Making Changes

When modifying this application:
- All changes must be made to the single `index.html` file
- JSX syntax is supported via Babel standalone
- Tailwind CSS classes are available for styling
- Lucide icons require calling `lucide.createIcons()` after DOM updates
- Timer audio is embedded as base64 data URI
