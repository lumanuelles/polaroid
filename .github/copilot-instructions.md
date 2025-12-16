# Polaroid Maker - AI Agent Instructions

## Project Overview
Browser-based polaroid photo editor that generates print-ready PDFs. Pure HTML/CSS/JavaScript app with no build tooling - edit files directly.

## Architecture

### Core State Management (`script.js`)
Single global `state` object (line 89-108) manages entire application:
- **Step flow**: `currentStep` (1-4), `selectedType` determines polaroid dimensions
- **Image pipeline**: `images[]` (uploaded), `cropData[]` (crop coordinates), mapped 1:1
- **Customization**: `textElements[]`, `graphicElements[]` with normalized coordinates (0-1)
- **Export**: `backgroundColor`, `backgroundType`, `specialBackground`, `cutMarkType`, `spacing`

### Polaroid Type System
`polaroidTypes` object (lines 1-87) defines 9 template types with physical dimensions in cm:
- Critical properties: `totalWidth/Height`, `imageWidth/Height`, `borderTop/Side/Bottom`
- Used for: aspect ratio calculation, PDF generation (300 DPI), canvas scaling
- Example: `classic` = 8.8×10.7cm total, 7.9×7.9cm image area

### Canvas Rendering Pattern
Two canvas contexts:
1. **Unified preview canvas** (`unifiedCanvasState`, lines 1117+): Interactive preview with drag/drop for text/graphics. Uses `requestAnimationFrame` debouncing to prevent flicker during interaction.
2. **PDF generation**: High-DPI (300 DPI) canvas per image, then composited into jsPDF pages

Coordinate system: All custom elements use normalized (0-1) coordinates, scaled to canvas dimensions during render.

## Critical Workflows

### Image Processing Flow
1. User uploads → `handleFiles()` creates `state.images[]` entries with original dimensions
2. Step 3: Crop box maintains aspect ratio from selected polaroid type. `cropData[]` stores crop coordinates in **original image pixel space**
3. Export: Coordinates converted to 300 DPI canvas space for final render

### PDF Generation (`generatePDF()`, line 2051)
- Calculates A4 grid layout: `cols × rows` based on polaroid dimensions + spacing
- Renders each image to temp 300 DPI canvas with: background → photo → graphics (conditional overlap) → text
- Uses jsPDF to composite into multi-page PDF with cut marks

### Text/Graphic Elements
- **Adding**: Pushes to `state.textElements[]` or `state.graphicElements[]` with default center position (0.5, 0.5)
- **Editing**: `selectedTextIndex`/`selectedGraphicIndex` tracks active element. UI controls update properties directly.
- **Rendering order**: Graphics layer controlled by `allowOverlap` flag - draws before OR after photo depending on setting
- **Interaction**: `hitTest()` function (line 1238) performs reverse lookup from canvas pixels to element indices

## Key Conventions

### File Structure
- `index.html`: All UI markup including 4-step wizard structure
- `script.js`: All logic, no modules/bundling
- `style.css`: CSS custom properties for theming (`--primary-color`, etc.)
- `img/`: Static background texture samples (floral.jpg, geometrico.jpg, reciclado.jpg)

### Step Navigation
`goToStep(step)` function manages wizard:
- Hides all `.step` sections, shows target, updates progress bar
- Special handling: Step 3 initializes crop view, Step 4 triggers `updateUnifiedCanvas()`

### Background System
Three modes (`backgroundType`):
- `solid`: Fill with `backgroundColor`
- `special`: Load texture from `specialBackground` (img/ folder)
- `gradient`: Two-tone gradient (not currently used in UI)

### Dimension Calculations
Pattern used throughout:
```javascript
const cmToPixels = (cm) => Math.round(cm * DPI / 2.54);
```
Always work in cm in config, convert to pixels for canvas operations.

## Testing/Debugging
- No test suite or build process
- Test locally: Open `index.html` in browser (requires CORS-friendly image loading)
- Common issues:
  - **Image flickering**: Check `requestCanvasUpdate()` debouncing
  - **Crop misalignment**: Verify `cropData` stored in original image coordinates, scaled during render
  - **PDF layout**: Grid calculation in `generatePDF()` - adjust margin/spacing logic

## External Dependencies
- **jsPDF 2.5.1**: Loaded via CDN (`index.html` line 8), accessed as `window.jspdf.jsPDF`
- No npm packages, no build step

## Common Modifications
- **Add polaroid type**: Insert new entry in `polaroidTypes` object + corresponding preview CSS in `.polaroid-preview` styles
- **New background effect**: Add case in `drawBackground()` function (script.js ~line 900+)
- **Adjust spacing**: Modify grid calculation in `generatePDF()` (lines 2070-2075)
