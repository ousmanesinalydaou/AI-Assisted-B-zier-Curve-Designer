# 🎨 Color Customization Guide

**Project:** CurveStack Composite Surface Generator  
**Purpose:** Guide for customizing visual element colors

---

## 📍 Overview

All visual element colors are defined in the `components/Viewer3D.tsx` file. Colors use hexadecimal format (e.g., `0x3b82f6` for blue). The project supports both **light** and **dark** themes with conditional color rendering.

---

## 🎨 Color Reference Table

### Standard Colors (Hexadecimal)

| Color Name | Hex Code | Preview |
|------------|----------|---------|
| Blue | `0x3b82f6` | 🔵 |
| Green | `0x22c55e` | 🟢 |
| Red | `0xef4444` | 🔴 |
| Purple | `0xa855f7` | 🟣 |
| Orange | `0xf59e0b` | 🟠 |
| Cyan | `0x06b6d4` | 🔵 |
| Pink | `0xec4899` | 🩷 |
| Yellow | `0xfbbf24` | 🟡 |
| White | `0xffffff` | ⚪ |
| Black | `0x000000` | ⚫ |
| Gray | `0x6b7280` | ⚪ |

---

## 🔧 How to Change Colors

### 1️⃣ **Surface Color** (Main B-spline Surface)

**File:** `components/Viewer3D.tsx`  
**Line:** 184  
**Current Color:** Blue (`0x3b82f6`)

```typescript
const material = new THREE.MeshPhysicalMaterial({
  color: 0x3b82f6,  // ← CHANGE THIS LINE
  side: THREE.DoubleSide,
  roughness: 0.2,
  metalness: 0.1,
  clearcoat: 0.5,
  transparent: true,
  opacity: 0.9,
  wireframe: mode === VisualizationMode.WIREFRAME,
  flatShading: false
});
```

**Example modifications:**
```typescript
color: 0x22c55e,  // Green surface
color: 0xa855f7,  // Purple surface
color: 0xef4444,  // Red surface
```

**Additional properties you can adjust:**
- `opacity: 0.9` → Change transparency (0.0 = invisible, 1.0 = solid)
- `roughness: 0.2` → Change surface roughness (0.0 = smooth, 1.0 = rough)
- `metalness: 0.1` → Change metallic appearance (0.0 = plastic, 1.0 = metal)

---

### 2️⃣ **Wireframe Overlay** (Grid lines in Hybrid mode)

**File:** `components/Viewer3D.tsx`  
**Line:** 201  
**Current Color:** Light cyan (dark mode) / Dark blue (light mode)

```typescript
const wireMat = new THREE.LineBasicMaterial({ 
  color: isDark ? 0xa5f3fc : 0x1e3a8a,  // ← CHANGE THIS LINE
  transparent: true, 
  opacity: 0.15 
});
```

**Explanation:**
- `isDark ? COLOR_A : COLOR_B` → Uses COLOR_A in dark mode, COLOR_B in light mode
- First value (`0xa5f3fc`) = dark mode color
- Second value (`0x1e3a8a`) = light mode color

**Example modifications:**
```typescript
color: isDark ? 0xfbbf24 : 0xf59e0b,  // Yellow/Orange wireframe
color: isDark ? 0xffffff : 0x000000,  // White/Black wireframe
color: 0x22c55e,                       // Same green in both modes
```

**Additional properties:**
- `opacity: 0.15` → Change wireframe visibility (0.0 = invisible, 1.0 = solid)

---

### 3️⃣ **Control Net** (Red grid showing control points)

**File:** `components/Viewer3D.tsx`  
**Line:** 217  
**Current Color:** Red

```typescript
const netColor = isDark ? 0xff4444 : 0xdc2626;  // ← CHANGE THIS LINE

// Used later for lines:
netGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ 
  color: netColor, 
  opacity: 0.3, 
  transparent: true 
})));

// Used for control points:
const pointsMat = new THREE.PointsMaterial({ 
  color: netColor, 
  size: 0.12 
});
```

**Example modifications:**
```typescript
const netColor = isDark ? 0x22c55e : 0x16a34a;  // Green control net
const netColor = isDark ? 0xa855f7 : 0x9333ea;  // Purple control net
const netColor = 0xfbbf24;                       // Yellow in both modes
```

**Additional properties:**
- Line opacity: `opacity: 0.3` (in LineBasicMaterial)
- Point size: `size: 0.12` (in PointsMaterial)

---

### 4️⃣ **Input Curves** (Stacked curves)

**File:** `components/Viewer3D.tsx`  
**Lines:** 136-145  
**Current Colors:** Orange/Yellow

**Curve Lines:**
```typescript
const material = new THREE.LineBasicMaterial({ 
  color: isDark ? 0xf59e0b : 0xd97706,  // ← CHANGE THIS LINE
  opacity: 0.8, 
  transparent: true 
});
```

**Curve Points:**
```typescript
const ptsMat = new THREE.PointsMaterial({ 
  color: isDark ? 0xfbbf24 : 0xf59e0b,  // ← CHANGE THIS LINE
  size: 0.15 
});
```

**Example modifications:**
```typescript
// Lines: Green curves
color: isDark ? 0x22c55e : 0x16a34a,

// Points: Cyan points
color: isDark ? 0x06b6d4 : 0x0891b2,
```

---

### 5️⃣ **Background Color**

**File:** `components/Viewer3D.tsx`  
**Lines:** 102-113  
**Current Colors:** Very dark (dark mode) / Light slate (light mode)

```typescript
if (isDark) {
    sceneRef.current.background = new THREE.Color(0x0a0a0a);  // ← Dark mode
    sceneRef.current.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
} else {
    sceneRef.current.background = new THREE.Color(0xf8fafc);  // ← Light mode
    sceneRef.current.fog = new THREE.FogExp2(0xf8fafc, 0.015);
}
```

**Example modifications:**
```typescript
// Darker background
sceneRef.current.background = new THREE.Color(0x000000);  // Pure black

// Lighter background
sceneRef.current.background = new THREE.Color(0xffffff);  // Pure white

// Colored background
sceneRef.current.background = new THREE.Color(0x1e293b);  // Dark slate blue
```

**Note:** Also update the fog color to match for visual consistency!

---

### 6️⃣ **Grid Helper** (Floor grid)

**File:** `components/Viewer3D.tsx`  
**Lines:** 107-115  

```typescript
if (isDark) {
    // GridHelper(size, divisions, centerColor, gridColor)
    const gh = new THREE.GridHelper(30, 30, 0x333333, 0x1a1a1a);  // ← CHANGE
} else {
    const gh = new THREE.GridHelper(30, 30, 0xcbd5e1, 0xe2e8f0);  // ← CHANGE
}
```

**Parameters:**
- First color (`0x333333`) = center line color
- Second color (`0x1a1a1a`) = grid lines color

**Example modifications:**
```typescript
// More visible dark mode grid
const gh = new THREE.GridHelper(30, 30, 0x666666, 0x333333);

// Colorful grid
const gh = new THREE.GridHelper(30, 30, 0x3b82f6, 0x1e3a8a);  // Blue grid
```

---

### 7️⃣ **Lighting** (Scene illumination)

**File:** `components/Viewer3D.tsx`  
**Lines:** 42-53  

```typescript
// Ambient light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // ← White, 50%

// Point light (localized highlight)
const pointLight = new THREE.PointLight(0x3b82f6, 1, 100);  // ← Blue light

// Directional light (sun-like)
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);  // ← White, 80%
```

**Example modifications:**
```typescript
// Warmer ambient lighting
const ambientLight = new THREE.AmbientLight(0xfff5e1, 0.6);

// Stronger colored accent
const pointLight = new THREE.PointLight(0xff4444, 1.5, 100);  // Red highlight

// Cooler directional light
const dirLight = new THREE.DirectionalLight(0xe0f2fe, 0.9);  // Cool white
```

---

## 📊 Complete Color Customization Example

### Example: Purple Theme with Green Accents

```typescript
// Surface: Purple
const material = new THREE.MeshPhysicalMaterial({
  color: 0xa855f7,  // Purple surface
  // ... other properties
});

// Wireframe: Light purple
const wireMat = new THREE.LineBasicMaterial({ 
  color: isDark ? 0xc084fc : 0x9333ea,
  // ...
});

// Control Net: Green
const netColor = isDark ? 0x22c55e : 0x16a34a;

// Input Curves: Cyan
const material = new THREE.LineBasicMaterial({ 
  color: isDark ? 0x06b6d4 : 0x0891b2,
  // ...
});

// Point Light: Purple accent
const pointLight = new THREE.PointLight(0xa855f7, 1, 100);
```

---

## 🎯 Quick Reference: Common Customization Tasks

### Task 1: Change Surface to Green
```typescript
// Line 184 in Viewer3D.tsx
color: 0x22c55e,
```

### Task 2: Make Wireframe More Visible
```typescript
// Line 201 in Viewer3D.tsx
const wireMat = new THREE.LineBasicMaterial({ 
  color: isDark ? 0xffffff : 0x000000,
  transparent: true, 
  opacity: 0.4  // Increased from 0.15
});
```

### Task 3: Change Control Net to Yellow
```typescript
// Line 217 in Viewer3D.tsx
const netColor = isDark ? 0xfbbf24 : 0xf59e0b;
```

### Task 4: Make Surface More Transparent
```typescript
// Line 184-192 in Viewer3D.tsx
const material = new THREE.MeshPhysicalMaterial({
  color: 0x3b82f6,
  // ...
  opacity: 0.6,  // Changed from 0.9
  // ...
});
```

### Task 5: Darker Background
```typescript
// Line 102 in Viewer3D.tsx
sceneRef.current.background = new THREE.Color(0x000000);
sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.02);
```

---

## 🧪 Testing Your Changes

After modifying colors:

1. **Save the file** (`Ctrl+S`)
2. **Check the browser** - Vite will hot-reload automatically
3. **Test both themes** - Toggle the theme button (sun/moon icon)
4. **Test all visualization modes:**
   - Solid
   - Wireframe
   - Hybrid

---

## 💡 Tips for the Professor

### Understanding Color Format

**Hexadecimal to RGB:**
- `0x3b82f6` = RGB(59, 130, 246)
- First 2 digits (3b) = Red component
- Middle 2 digits (82) = Green component
- Last 2 digits (f6) = Blue component

### Material Properties Impact

**Roughness:**
- `0.0` = Mirror-like, smooth reflections
- `1.0` = Matte, diffuse surface

**Metalness:**
- `0.0` = Dielectric (plastic, rubber)
- `1.0` = Metallic (gold, silver)

**Opacity:**
- `0.0` = Completely transparent
- `1.0` = Completely opaque

### Why Conditional Colors?

```typescript
color: isDark ? 0xa5f3fc : 0x1e3a8a
```

This ensures good contrast in both themes:
- Dark mode needs lighter colors to stand out
- Light mode needs darker colors to be visible

---

## 📝 Live Demo Script for Exam

**What to say while changing colors:**

> "To customize the visual appearance, I can modify the color parameters in the Viewer3D component. For example, to change the surface color from blue to green, I would go to line 184 and change `color: 0x3b82f6` to `color: 0x22c55e`. The color is defined in hexadecimal format, which Three.js uses for WebGL rendering. 
>
> I can also adjust material properties like opacity, roughness, and metalness to change how the surface reflects light. The project uses conditional rendering for dark and light themes, so some elements have theme-aware colors using the ternary operator."

**Example modification to demonstrate:**
1. Open `Viewer3D.tsx`
2. Navigate to line 184
3. Change `color: 0x3b82f6` to `color: 0x22c55e`
4. Save and show the green surface appear
5. Explain the hexadecimal format

---

## 🔗 Related Files

- **Main visualization:** `components/Viewer3D.tsx`
- **Theme state:** `App.tsx` (line 11 - theme state)
- **Type definitions:** `types.ts` (Theme enum)

---

**Last Updated:** December 17, 2025
