# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive single-page React application that consolidates three sourdough-related tools into one unified interface:
1. **Sourdough Bread Recipe** - Beginner-friendly guide with timers and step tracking
2. **Focaccia Recipe** - Italian flatbread with customizable hydration and fermentation
3. **Bulk Fermentation Calculator** - Scientific timing predictions based on temperature and starter percentage

The entire application is contained in `index.html` as a self-contained HTML file with embedded React code using Babel standalone.

## Technology Stack

- **React 18**: Loaded via UMD from unpkg.com
- **Babel Standalone**: For JSX transpilation in the browser
- **Tailwind CSS**: Loaded via CDN for styling
- **Lucide Icons**: Icon library loaded via UMD
- **LocalStorage API**: For persisting user preferences

## Architecture

The application uses a tab-based navigation system with three main components:

### Main Application Structure

1. **SourdoughApp**: Root component managing tabs and shared state
   - Tab navigation (Sourdough Bread, Focaccia, Bulk Fermentation Calculator)
   - Shared preferences (temperature unit, baker's percentages)
   - LocalStorage persistence

2. **SourdoughBread Component**: Original beginner's sourdough recipe
   - Recipe scaling (0.5x to 4x)
   - Interactive timers
   - Step tracking
   - Timeline calculator
   - Base recipe: 500g flour, 105g starter, 342g water, 11g salt

3. **Focaccia Component**: Italian flatbread recipe
   - Recipe scaling (0.25x to 4x)
   - Hydration control (78-84%)
   - Yeast type selection (commercial vs sourdough)
   - Fermentation time adjustment (12-72 hours)
   - Auto-calculating yeast/starter amounts
   - Traditional topping suggestions

4. **FermentationCalculator Component**: Scientific bulk fermentation predictor
   - Temperature input with F/C conversion
   - Starter percentage (5-30%)
   - Rise target selection (75% or 100%)
   - Bilinear interpolation algorithm
   - Empirical fermentation data (32 data points)
   - Completion time calculator
   - Educational content

### State Management

**Global State** (in SourdoughApp):
- `activeTab`: Currently selected tab
- `preferences`: Shared preferences object
  - `tempUnit`: Temperature unit (F or C)
  - `showBakersPercent`: Toggle for baker's percentages

**Component-Specific State**:
- Each component manages its own local state (scales, timers, inputs, etc.)
- All preferences are persisted to localStorage

## Development

### Running the Application

Simply open `index.html` in a web browser. No build process or server is required.

### Testing Changes

Refresh the browser after making edits to `index.html`.

### Key Components and Functions

**Shared Components:**
- **Tab Navigation**: Buttons to switch between three main views
- **Icon Components**: Wrapper functions for Lucide icons with `lucide.createIcons()` initialization

**Sourdough Bread:**
- **TimerDisplay**: Reusable timer component with start/stop functionality
- **calculateTimeline**: Generates suggested timeline based on start time
- **toggleStep**: Tracks completion of process steps

**Focaccia:**
- **calculateWaterAmount**: Adjusts water based on hydration and yeast type
- **calculateYeastAmount**: Adjusts yeast based on fermentation time using exponential decay

**Fermentation Calculator:**
- **bilinearInterpolate**: Interpolates fermentation time between data points
- **fermentationData**: 32 empirical data points (4 starter % × 5 temps × 2 rise targets)
- **calculateCompletionTime**: Calculates when fermentation will complete

## Code Structure

The React code is embedded in a `<script type="text/babel">` tag starting at line 34.

**Application Flow:**
1. Root component (SourdoughApp) renders header and tab navigation
2. Based on activeTab, renders one of three components:
   - SourdoughBread (lines 138-572)
   - Focaccia (lines 574-875)
   - FermentationCalculator (lines 877-1198)
3. Each component receives preferences and updatePreference as props
4. Preferences are automatically saved to localStorage on change

**Styling:**
- Gradient background on body
- Tab buttons with hover effects
- Consistent color scheme: purple primary, with semantic colors for warnings/tips
- Responsive design using Tailwind's breakpoints

## Making Changes

When modifying this application:
- All changes must be made to the single `index.html` file
- JSX syntax is supported via Babel standalone
- Tailwind CSS classes are available for styling
- Lucide icons require calling `lucide.createIcons()` after DOM updates (in useEffect)
- Timer audio is embedded as base64 data URI
- LocalStorage keys: 'sourdoughPreferences' for shared settings
- Keep components self-contained but consistent in style and UX patterns

## Data Attribution

The bulk fermentation calculator uses empirical data based on research from The Sourdough Journey. The data represents controlled testing with 90% King Arthur Bread Flour and 10% whole wheat at various temperatures and starter percentages.
