# AGENTS.md

## Rehabbit

Rehabbit is a digital wellbeing app designed to help users recover time from apps they use automatically, especially social media, and redirect that time toward activities they intentionally want to do.

The product is not simply an app blocker.

Its core idea is:

**interrupt the automatic behavior → redirect the user to a chosen replacement activity → help them recover their time.**

Before making product, UI, or architectural decisions, understand this goal and read the project documentation below.

---

## Required Documentation

Before working on this project, read:

### Product behavior
`docs/project-definition.md`

Source of truth for:
- Product goal and hypothesis
- User flows
- Modes
- Blocked apps
- Replacement apps
- Scheduling
- Blocking behavior
- Replacement time and earned social-app time
- Dashboard statistics
- Screen behavior and product rules

Do not invent product behavior that conflicts with this document.

### Design system
`docs/design-sytem.md`

Source of truth for:
- Visual language
- Design tokens
- Typography
- Spacing and radius
- Reusable UI components
- Component states
- Approved visual references
- Rules for creating or extending components

Before creating a UI component, check whether an existing component can be reused or extended.

### Architecture
`docs/architecture-definition.md`

Source of truth for:
- Application architecture
- Module boundaries
- Platform responsibilities
- Data flow
- Native Android responsibilities
- React Native/Expo responsibilities
- Persistence and services
- Technical implementation constraints

Do not introduce a new architectural pattern without checking this document first.

---

## Decision Order

When implementing a feature, use this order:

**Product Definition → Architecture Definition → Design System → Existing Code → Implementation**

Ask:

1. **What should happen?**  
   Read `project-definition.md`.

2. **Where should this logic live?**  
   Read `architecture-definition.md`.

3. **Which component and visual pattern should represent it?**  
   Read `design-sytem.md`.

4. **Does an implementation already exist?**  
   Search the codebase before creating anything new.

5. **Implement the smallest change that fits the existing system.**

---

## Core Product Concepts

Use this terminology consistently:

- **Mode:** scheduled period where the user wants to protect their time.
- **Blocked App:** app the user wants to reduce or avoid during a Mode.
- **Replacement App:** app the user intentionally chose to use instead.
- **Blocking Screen:** intervention shown when the user attempts to open a Blocked App during an active Mode.
- **Recovered Time:** time reclaimed from the unwanted behavior. Time spent inside Rehabbit itself is not recovered time.

Do not refer to Replacement Apps as "Rehabbit Apps."

Rehabbit is the intervention layer, not the replacement activity.

---

## Implementation Principles

- Preserve the product behavior defined in the documentation.
- Reuse existing architecture and components before adding new ones.
- Do not duplicate business logic between screens or platforms.
- Do not create parallel UI systems or arbitrary visual patterns.
- Do not infer missing product behavior from UI screenshots.
- Do not change product rules merely to simplify implementation.
- Keep changes scoped to the requested task.
- Update the relevant documentation when an approved change modifies product behavior, architecture, or the design system.

When documentation and existing code disagree, do not silently assume the code is correct. Determine which documented source owns that decision and align the implementation accordingly.