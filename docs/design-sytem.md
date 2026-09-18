# Rehabbit Design System

This document defines how Rehabbit UI components should be created and reused.

For product behavior, flows, and business rules, read `product-definition.md`.

Approved screenshots in `project-description/ui-references/` are the visual source of truth.

---

## 1. Visual Language

Rehabbit is a light, consumer-focused digital wellbeing app.

The UI should feel:
- Clean
- Friendly
- Modern
- Spacious
- Highly rounded
- Encouraging, never punitive

Default UI:
- Light background
- White surfaces
- Dark typography
- Subtle borders
- Minimal shadows

Brand gradient is reserved for important moments:
- Progress
- Primary actions
- Selected focal states
- Summary/hero cards
- Blocking/intervention screen

Glass is an accent, not the default card style. Use it only for floating controls, overlays, or when the approved reference shows translucency.

---

## 2. Foundations

### Colors

- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Strong border: `#CBD5E1`
- Primary text: `#1F2430`
- Secondary text: `#707785`
- Primary: `#4F46E5`
- Secondary primary: `#6366F1`
- Progress accent: `#38BDF8`
- Primary container: `#EEF2FF`

Use the existing Rehabbit gradient tokens for brand gradients. Never create component-specific gradients in screen code.

### Typography

Use **Satoshi only**.

Existing configuration:
`apps/expo/components/font-satoshi.ts`

Assets:
`apps/expo/assets/fonts/satoshi/`

Hierarchy:
- Large screen/hero title: 32–48px / 700
- Section heading: 24–32px / 700
- Component heading: 18–24px / 600–700
- Body: 16–18px / 400
- Label: 12–14px / 500–600

Prefer existing Tamagui typography tokens over hard-coded sizes.

### Spacing

- Screen horizontal margin: `24px`
- Standard component gap: `16px`
- Small internal gap: `8px`
- Major section gap: `32px`

Use the existing `$space` tokens instead of creating a new spacing scale.

### Radius

- Small control: `12px`
- Button/input: `16px`
- Card: `24px`
- Large focal container: `24–32px`
- Chip/pill: fully rounded when appropriate

Use existing `$radius` tokens.

---

# 3. Component Rules

Before creating a component:

1. Search for an existing component that represents the same pattern.
2. Reuse it when possible.
3. Add a variant/state when the difference is behavioral or visual.
4. Create a new component only when the pattern is genuinely different or reusable.
5. Never duplicate a component just for one screen.

Components should receive state/data from the product layer. Do not duplicate product logic inside visual components.

---

## PrimaryButton

Main action.

- Brand primary/gradient
- White label
- 16px rounded corners
- Clear pressed, loading and disabled states

Only one action should normally dominate a section.

---

## SecondaryButton

Secondary actions.

- White/light surface
- Subtle border
- Dark or primary text
- Same general geometry as PrimaryButton

---

## CircularIconButton

Used for Back, Settings, Add and similar actions.

- Circular
- White/light surface
- Subtle border
- Centered icon

Use `@tamagui/lucide-icons`.

---

## Chip

Used for compact selections.

Default:
- White surface
- Subtle border
- Dark text

Selected:
- Primary/gradient emphasis
- White text

All chips in the same group must use the same selected-state treatment.

---

## ProgressRing

Used for duration and progress.

Contains:
- Neutral circular track
- Brand progress stroke
- Large central time/value
- Optional secondary progress label

Used in:
- Create/Edit Mode
- Blocking Screen

Reuse the same component with visual variants instead of creating separate rings.

Reference: Create Mode and Blocking Screen screenshots.

---

## DurationSelector

Horizontal group of selectable duration chips.

Example:
`15 min | 25 min | 60 min | Custom`

Only one value appears selected.

Reference: Create Mode screenshot.

---

## CategorySelector

Grid of selectable categories.

Each item contains:
- Icon
- Label

Default:
- White surface
- Border
- Dark content

Selected:
- Primary/gradient surface
- White content

Reference: Create Mode screenshot.

---

## AppIcon

Always reuse:

`apps/expo/components/app.icon.tsx`

Do not implement application icon rendering separately.

---

## AppAvatarGroup

Compact representation of multiple apps.

- Circular app icons
- Slight overlap
- `+N` when additional apps exist

Use for blocked and replacement app summaries.

---

## AppSelectionCard

Used to configure:
- Blocked Apps
- Replacement Apps

Contains:
- Label/title
- Current apps or empty state
- Add/edit action
- Optional short supporting text

Blocked and replacement apps should use variants of the same component, not separate visual systems.

Reference: Create Mode screenshot.

---

## ScheduleCard

Contains:
- Start time
- End time
- Day selector
- Repetition summary

Use the same Chip/selected-state language defined above.

---

## ModeCard

Represents a Mode on the Dashboard.

Contains:
- Mode name
- App icon(s)
- Schedule
- Repetition

Default:
- White surface
- Subtle border
- 24px rounded corners
- No heavy shadow

Paused:
- Preserve the card
- Apply muted/grey treatment
- Show `Resume`

Do not create different ModeCard implementations for different screens.

Reference: Dashboard screenshot.

---

## SummaryCard

Focal statistics card on Dashboard.

- Rehabbit gradient
- Large rounded corners
- White text
- Large metric values
- Supporting labels with lower emphasis

Use this strong gradient treatment selectively.

Reference: Dashboard screenshot.

---

## ReplacementAppCard

Action displayed on the Blocking Screen.

Contains:
- App icon
- App name
- Open/forward indicator

Style:
- Glass/translucent surface
- Light border
- White content
- Large rounded corners

The complete card is actionable.

Reference: Blocking Screen screenshot.

---

## FloatingNavigation

Dashboard navigation.

- Floating rounded container
- Light/glass surface
- Subtle elevation
- Primary active state
- Muted inactive states
- Separate circular Add action when required

Do not replace it with a generic Material bottom bar.

Reference: Dashboard screenshot.

---

# 4. Existing UI System

Rehabbit uses **Tamagui**.

Sources of truth:

- `apps/expo/tamagui.config.ts`
- `apps/expo/theme/colors.ts`
- `apps/expo/theme/tokens.ts`
- `apps/expo/theme/theme-builder.ts`
- `apps/expo/theme/theme-output.ts`
- `apps/expo/components/font-satoshi.ts`

Prefer:
- `View`
- `XStack`
- `YStack`
- `Button`
- `Input`
- `Paragraph`
- `SizableText`
- `Heading`

Use existing semantic tokens instead of raw values.

Do not introduce:
- New hard-coded colors
- New fonts
- New spacing scales
- New radius scales
- New shadow recipes
- New theme providers
- Another icon library

If a new brand value is approved, add it to the theme/tokens first and consume the token from components.

---

# 5. Existing Components

Inspect these before creating anything new:

- `Container` → `apps/expo/components/container.tsx`
- `ShadowCard` → `apps/expo/components/shadow.card.tsx`
- `Header` → `apps/expo/components/header.tsx`
- `AppIcon` → `apps/expo/components/app.icon.tsx`
- `Divider` → `apps/expo/components/divider.tsx`
- `weekly-summary.tsx`
- `percentage.trend.tsx`
- `pie.chart.tsx`
- `line.chart.tsx`

If an existing component is close to the approved design, extend/refactor it instead of creating a parallel implementation.

---

# 6. Rule for Agents

For every UI task:

**Product Definition → approved screenshot → Design System → existing component → implementation.**

Before coding:
1. Understand the behavior from `product-definition.md`.
2. Find the approved screenshot in `project-description/ui-references/`.
3. Identify the Design System components visible in it.
4. Inspect existing implementations.
5. Reuse or extend them.
6. Only then create missing components.

Do not invent a new visual pattern when an approved reference exists.

If no reference or component covers a genuinely new UI pattern, ask for visual direction instead of guessing.

After implementation, verify the result visually on the target Android device/emulator. Passing TypeScript is not sufficient.