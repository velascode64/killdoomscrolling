---
name: Luminous Clarity
colors:
  surface: '#f8fafc'
  surface-dim: '#e2e8f0'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8fafc'
  surface-container: '#e2e8f0'
  surface-container-high: '#e2e8f0'
  surface-container-highest: '#cbd5e1'
  on-surface: '#1f2430'
  on-surface-variant: '#707785'
  inverse-surface: '#1f2430'
  inverse-on-surface: '#ffffff'
  outline: '#cbd5e1'
  outline-variant: '#e2e8f0'
  surface-tint: '#4f46e5'
  primary: '#4f46e5'
  on-primary: '#ffffff'
  primary-container: '#eef2ff'
  on-primary-container: '#1f2430'
  inverse-primary: '#6366f1'
  secondary: '#6366f1'
  on-secondary: '#ffffff'
  secondary-container: '#c7d2fe'
  on-secondary-container: '#1f2430'
  tertiary: '#38bdf8'
  on-tertiary: '#ffffff'
  tertiary-container: '#e0f2fe'
  on-tertiary-container: '#1f2430'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7d2fe'
  primary-fixed-dim: '#a5b4fc'
  on-primary-fixed: '#1f2430'
  on-primary-fixed-variant: '#3730a3'
  secondary-fixed: '#c7d2fe'
  secondary-fixed-dim: '#a5b4fc'
  on-secondary-fixed: '#1f2430'
  on-secondary-fixed-variant: '#3730a3'
  tertiary-fixed: '#e0f2fe'
  tertiary-fixed-dim: '#7dd3fc'
  on-tertiary-fixed: '#1f2430'
  on-tertiary-fixed-variant: '#0369a1'
  background: '#f8fafc'
  on-background: '#1f2430'
  surface-variant: '#e2e8f0'
  brand-gradient-start: '#4f46e5'
  brand-gradient-middle: '#6366f1'
  brand-gradient-end: '#6366f1'
  progress-accent: '#38bdf8'
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

This design system embodies a premium, iOS-inspired aesthetic focused on focus and digital well-being. It leverages **Glassmorphism** and **Minimalism** to create an interface that feels lightweight yet structured. The brand personality is active, optimistic and focused, using Electric Indigo on a near-white canvas.

The visual narrative relies on depth created through translucency and blurred background elements, mimicking the high-fidelity experience of a modern mobile OS lock screen. The goal is to provide a "quiet" environment that feels like a premium sanctuary for the user's focus.

## Colors

The palette is anchored by the near-white canvas **#F8FAFC** and elevated cards **#FFFFFF**. Indigo is used for interactive emphasis; **#38BDF8** is reserved for small progress accents.

The primary visual driver is a restrained diagonal gradient: **#4F46E5 -> #6366F1**. This gradient is reserved for primary CTAs and active progress. Text content is rendered in **#1F2430**, with **#707785** for supporting text.

## Typography

This system uses **Inter** to replicate the clean, systematic feel of San Francisco (system-ui). The typographic hierarchy is designed for high contrast and immediate scanning. 

Headers utilize a tighter letter-spacing and heavy weights to ground the layout. Body text maintains generous line-heights for breathability. All primary text should be set in `#1F2430`, while secondary labels use `#707785`.

## Layout & Spacing

The layout follows a **fluid grid** model with generous safe areas. For mobile, a 24px side margin is mandatory to create the "floating card" effect characteristic of modern iOS interfaces.

Vertical rhythm is based on a 4px baseline grid. Components are typically separated by `stack-lg` (32px) to ensure the UI feels expansive and uncrowded. Elements within a card should use `stack-sm` or `stack-md` to maintain internal cohesion.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows. 
- **Surface Layer:** Cards use a background of `rgba(255, 255, 255, 0.7)` with a `backdrop-filter: blur(20px)`.
- **Borders:** Surfaces are defined by a hair-line border (1px) in `#E2E8F0` to provide structure without adding visual weight.
- **Inner Glow:** Interactive elements like the Radial Progress may use a soft `#38BDF8` accent at low opacity.
- **Stacked Depth:** When overlays appear, the background content should scale down slightly (95%) and increase blur, mimicking the iOS modal behavior.

## Shapes

The design system employs **High Roundedness** to evoke a friendly and premium feel. 
- **Cards & Containers:** Use a base radius of 24px. For large focal elements (like the timer overlay), this can increase to 32px.
- **Interactive Elements:** Buttons use a 16px radius, while small status indicators and tags use a fully rounded pill shape.
- **Icons:** Should follow a rounded-cap style to match the UI's softness.

## Components

### Buttons
- **Primary:** Filled with `#4F46E5 -> #6366F1`. Text is white. Rounded 16px.
- **Secondary:** Glass-filled (white 70% + blur) with the 1px subtle border. Text in `#1F2430`.

### Cards
- Always `#FFFFFF` or semi-transparent glass. 24px corners. 1px `#E2E8F0` border. No heavy drop shadows—only a very soft, large-radius ambient shadow if depth is absolutely necessary.

### Radial Progress
- High-fidelity gradient stroke (`#4F46E5 -> #6366F1`). The track uses `#E2E8F0`. Add a small `#38BDF8` accent to the leading edge of the progress line.

### Input Fields
- Subtle near-white background (`#F8FAFC`) or glass-morphic white. Focus state is defined by a 2px indigo border.

### Chips & Tags
- Small, pill-shaped elements. Active chips use indigo emphasis; inactive chips use `#FFFFFF`, `#E2E8F0` border, and `#1F2430` text.
