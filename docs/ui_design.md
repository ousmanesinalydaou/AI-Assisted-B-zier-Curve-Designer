# UI Design System

## Aesthetic
- **Theme**: Dark / Cyberpunk-lite.
- **Backgrounds**: Deep neutral grays (`#111`) with subtle radial gradients.
- **Panels**: Glassmorphism effect using semi-transparent blacks (`bg-neutral-900/95`) and backdrop blur filters.
- **Accents**: Electric Blue (`#3b82f6`) for active states, Amber (`#fbbf24`) for raw data visualization.

## Interaction Patterns
- **Direct Manipulation**: Drawing on the canvas provides immediate feedback.
- **Live Sliders**: Changing a slider (e.g., Degree) instantly triggers a re-computation of the surface.
- **Responsive**: The layout uses Flexbox to adapt, keeping the 3D view central and maximizing space.

## Visual Hierarchy
1.  **3D Viewport**: The primary focus.
2.  **Control Panel**: Situated on the left, organized by logical groups (Input -> Config -> Math).
3.  **Overlays**: Minimal floating buttons for view modes to avoid clutter.
