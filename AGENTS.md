# Rehabbit / Digital Break - Engineering and Design Rules

## Product Scope

- Android is the only active product. Do not add, redesign, test, or change iOS behavior unless the request explicitly says to resume iOS work. iOS is frozen because it cannot provide the Android native overlay experience.
- Preserve one product experience: one onboarding model, one dashboard model, and shared React Native screens. Native code may differ only where the operating system requires it.
- The app helps users replace blocked social apps with focused activity. Every screen must make the current state, next action, and reward obvious.

## Mandatory Design Workflow

Before changing any UI:

1. Read this file and inspect the target screen plus the existing components listed below.
2. Reuse the closest existing component and its visual language. Extend it only when it cannot represent the required state.
3. Do not invent a new layout, color direction, card style, onboarding sequence, or interaction pattern from a text-only request. Ask for a Figma link, screenshot, or approved reference when visual direction is not already in the repository.
4. For a new flow, enumerate its screens and states before editing: empty, loading, configured, active, completed, error, and permission-denied when relevant.
5. Verify on the target Android device or emulator after implementation. A UI change is not complete based only on TypeScript passing.

## Product Flow and Visual Reference

Before changing onboarding, mode creation/editing, schedule selection, blocked/replacement apps, or dashboard cards, read `project-description/appflow-ui-system.md`.

- This file is the source of truth for the current Android product flow, active screenshots, light-only theme, brand gradient, component behavior, and screen states.
- Its source images are in `project-description/ui-references/`. Do not use deleted or unlisted images as visual references.
- Do not reinterpret the documented flow into a generic dashboard, plan card, or onboarding sequence. If a requested UI conflicts with the document, update the document with an approved reference before implementing it.

## Existing UI System: Source of Truth

The app uses **Tamagui**. Keep a single visual system; do not add a parallel CSS system, a second theme provider, or an arbitrary color palette.

- Theme configuration: `apps/expo/tamagui.config.ts`
- Color source of truth: `apps/expo/theme/colors.ts`
- Semantic tokens and spacing/radius scales: `apps/expo/theme/tokens.ts`
- Generated Tamagui themes: `apps/expo/theme/theme-builder.ts` and `apps/expo/theme/theme-output.ts`
- Fonts: `apps/expo/components/font-satoshi.ts` and the Satoshi assets in `apps/expo/assets/fonts/satoshi/`
- Theme behavior: `apps/expo/components/theme-provider.tsx`

Use semantic Tamagui tokens in UI code:

- Surfaces: `$background1`, `$background2`, `$grey1`, `$grey3`
- Text: `$text11` for primary text, `$text6` or `$grey7` for supporting text
- Accent families: `$primary1` through `$primary12`, or the existing `$blue*`, `$green*`, `$orange*`, `$red*`, `$yellow*` families
- Layout: `$space` and `$radius` values such as `$1`, `$2`, `$3`, `$4`; do not hard-code a new spacing scale

Do not introduce a new hex, RGB/RGBA, gradient, font family, shadow recipe, or component-specific color in screen code. If a genuinely new brand color is approved, add it once to `theme/colors.ts` and expose it through `theme/tokens.ts`; then consume the token everywhere. Existing legacy hard-coded colors may be migrated to tokens when touching that component, but do not copy them into new work.

## Components to Reuse

- Page structure and safe areas: `apps/expo/components/container.tsx` (`Container`)
- Default elevated card: `apps/expo/components/shadow.card.tsx` (`ShadowCard`)
- App header and settings entry: `apps/expo/components/header.tsx` (`Header`)
- App/service icon rendering: `apps/expo/components/app.icon.tsx` (`AppIcon`)
- Vertical separator: `apps/expo/components/divider.tsx` (`Divider`)
- Dashboard visual patterns: `apps/expo/components/weekly-summary.tsx`, `apps/expo/components/percentage.trend.tsx`, `apps/expo/components/pie.chart.tsx`, and `apps/expo/components/line.chart.tsx`
- Icons: `@tamagui/lucide-icons`; do not add another icon library without an explicit request.

Use Tamagui `View`, `XStack`, `YStack`, `Button`, `Input`, `Paragraph`, `SizableText`, `Heading`, and existing themes before using raw React Native primitives. Use `react-native-svg` only for actual graphics/charts and `expo-linear-gradient` only when a design reference explicitly contains a gradient.

## Typography and Content

- Use the existing Satoshi font configuration only. Do not introduce Inter, Roboto, Arial, or system fonts.
- Use Tamagui type tokens before explicit pixel sizes. Use explicit sizes only when matching an approved visual reference.
- Keep product text direct, short, and action-oriented. Preserve the app's existing language on the screen; do not mix Spanish and English inside a single new flow.

## Onboarding and Focus Flow

- Preserve the plan fields across all screens: blocked apps, focus/replacement apps, schedule, required focus duration, and earned unlock duration.
- App selection, plan editing, dashboard summary, and the blocked/focus screen must display the same persisted plan. Do not create a platform-only dashboard or a simplified second onboarding.
- The Android native blocker is an adapter for interception, usage measurement, and opening selected apps. React Native owns the product UI and dashboard.

## Canonical Android Locker

- The native Android overlay in `packages/expo-app-blocker/android/src/main/java/expo/modules/appblocker/OverlayManager.kt` is the core product experience. It is the only locker shown when a blocked app is opened.
- Preserve its turquoise-to-blue gradient, circular progress ring, countdown, replacement-app cards, real app icons, and arrow-to-open behavior. Focus, Sleep, and Work reuse this exact layout; only their copy and selected replacement apps may change.
- Never replace the native locker with a React Native `blocked` screen, deep link, white card, generic overlay, or a second visual design. Any visual change to this overlay requires an approved reference and explicit user request.
- The plan form must remain one card with sections. Installed app discovery/search belongs in a modal sheet opened from a `+` button; the form itself only displays selected apps.

## Libraries and Changes

- Keep Expo Router for navigation, Tamagui for UI/theme, React Native SVG for vector graphics, and `@tamagui/lucide-icons` for icons.
- Do not add a UI kit, styling framework, font package, icon package, state library, or chart library unless the existing stack cannot meet a documented requirement.
- Preserve the repository's Bun scripts and workspace structure. Do not use `expo prebuild --clean` unless explicitly requested; it regenerates native files.
- Use `apply_patch` for manual edits. Do not revert unrelated worktree changes.

## Verification

- Run `bun x tsc --noEmit --incremental false` in `apps/expo` for TypeScript UI changes.
- For Android native or blocker changes, build with `bun run android:apk` or install with `bun run android` and test the actual flow: configure plan, open a blocked app, see the focus screen, open a focus app, earn time, and re-block.
- Report what was visually verified and what remains unverified. Do not claim visual fidelity without a reference and a device/emulator check.
