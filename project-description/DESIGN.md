---
name: Luminous Clarity
colors:
  surface: '#f8fdfe'
  surface-dim: '#cfebf0'
  surface-bright: '#fdffff'
  surface-container-lowest: '#fdffff'
  surface-container-low: '#f8fdfe'
  surface-container: '#cfebf0'
  surface-container-high: '#cfebf0'
  surface-container-highest: '#d0d8de'
  on-surface: '#003b5c'
  on-surface-variant: '#36586f'
  inverse-surface: '#003b5c'
  inverse-on-surface: '#fdffff'
  outline: '#d0d8de'
  outline-variant: '#cfebf0'
  surface-tint: '#2ccefe'
  primary: '#2ccefe'
  on-primary: '#ffffff'
  primary-container: '#1ae1fe'
  on-primary-container: '#003b5c'
  inverse-primary: '#1ae1fe'
  secondary: '#4bb7fe'
  on-secondary: '#ffffff'
  secondary-container: '#a2e4fa'
  on-secondary-container: '#003b5c'
  tertiary: '#36586f'
  on-tertiary: '#ffffff'
  tertiary-container: '#cfebf0'
  on-tertiary-container: '#003b5c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#53f9f5'
  primary-fixed-dim: '#21dcd8'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504e'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#9fcaff'
  on-secondary-fixed: '#001d37'
  on-secondary-fixed-variant: '#00497e'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#aec7f9'
  on-tertiary-fixed: '#001b3f'
  on-tertiary-fixed-variant: '#2e4771'
  background: '#f8fdfe'
  on-background: '#003b5c'
  surface-variant: '#cfebf0'
  brand-gradient-start: '#1ae1fe'
  brand-gradient-middle: '#2ccefe'
  brand-gradient-end: '#4bb7fe'
  mesh-cyan: '#67ddfc'
  mesh-blue: '#a2e4fa'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system embodies a premium, iOS-inspired aesthetic focused on focus and digital well-being. It leverages **Glassmorphism** and **Minimalism** to create an interface that feels lightweight yet structured. The brand personality is calm, high-end, and authoritative, evoking a sense of mental clarity through a near-white canvas punctuated by cyan-to-blue gradients.

The visual narrative relies on depth created through translucency and blurred background elements, mimicking the high-fidelity experience of a modern mobile OS lock screen. The goal is to provide a "quiet" environment that feels like a premium sanctuary for the user's focus.

## Colors

The palette is anchored by the near-white canvas **#F8FDFE** and elevated cards **#FDFFFF**. To prevent the interface from feeling sterile, subtle mesh gradients using **#67DDFC** and **#A2E4FA** are placed in the corners at minimal opacity, creating soft, ethereal depth.

The primary visual driver is a three-stop diagonal gradient: **#1AE1FE -> #2CCEFE -> #4BB7FE**. This gradient is reserved for primary CTAs, active progress states, selected controls, and key data visualizations. Text content is strictly rendered in deep navy **#003B5C**, with **#36586F** for supporting text.

## Typography

This system uses **Inter** to replicate the clean, systematic feel of San Francisco (system-ui). The typographic hierarchy is designed for high contrast and immediate scanning. 

Headers utilize a tighter letter-spacing and heavy weights to ground the layout. Body text maintains generous line-heights for breathability. All primary text should be set in deep navy `#003B5C`, while secondary labels use `#36586F`.

## Layout & Spacing

The layout follows a **fluid grid** model with generous safe areas. For mobile, a 24px side margin is mandatory to create the "floating card" effect characteristic of modern iOS interfaces.

Vertical rhythm is based on a 4px baseline grid. Components are typically separated by `stack-lg` (32px) to ensure the UI feels expansive and uncrowded. Elements within a card should use `stack-sm` or `stack-md` to maintain internal cohesion.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows. 
- **Surface Layer:** Cards use a background of `rgba(255, 255, 255, 0.7)` with a `backdrop-filter: blur(20px)`.
- **Borders:** Surfaces are defined by a hair-line border (1px) in `#CFEBF0` to provide structure without adding visual weight.
- **Inner Glow:** Interactive elements like the Radial Progress should feature a soft outer glow using `#67DDFC` at low opacity to simulate light emission.
- **Stacked Depth:** When overlays appear, the background content should scale down slightly (95%) and increase blur, mimicking the iOS modal behavior.

## Shapes

The design system employs **High Roundedness** to evoke a friendly and premium feel. 
- **Cards & Containers:** Use a base radius of 24px. For large focal elements (like the timer overlay), this can increase to 32px.
- **Interactive Elements:** Buttons use a 16px radius, while small status indicators and tags use a fully rounded pill shape.
- **Icons:** Should follow a rounded-cap style to match the UI's softness.

## Components

### Buttons
- **Primary:** Filled with `#1AE1FE -> #2CCEFE -> #4BB7FE`. Text is white. Rounded 16px.
- **Secondary:** Glass-filled (white 70% + blur) with the 1px subtle border. Text in `#003B5C`.

### Cards
- Always `#FDFFFF` or semi-transparent glass. 24px corners. 1px `#CFEBF0` border. No heavy drop shadows—only a very soft, large-radius ambient shadow if depth is absolutely necessary.

### Radial Progress
- High-fidelity gradient stroke (`#1AE1FE -> #2CCEFE -> #4BB7FE`). The track uses `#CFEBF0`. Add a soft `#67DDFC` glow to the leading edge of the progress line.

### Input Fields
- Subtle near-white background (`#F8FDFE`) or glass-morphic white. Focus state is defined by a 2px border using the primary gradient.

### Chips & Tags
- Small, pill-shaped elements. Active chips use the brand gradient with white text; inactive chips use `#FDFFFF`, `#CFEBF0` border, and `#003B5C` text.
