---
id: nextjs
title: Next.js
version: 3
schemaVersion: 1
description: Senior-level Next.js learning path
minimumGameVersion: 1.0.0
progression:
  minimumLevel: 1
  maximumLevel: 10
  estimatedDaysPerLevel: 7
  bossRequired: true
  levels:
    - level: 1
      title: Foundations
      description: Core Next.js concepts, project structure, and the App Router
      difficultyRange: { minimum: 1, maximum: 2 }
      requiredMastery: 65
      requiredSuccessfulEncounters: 24
      requiredReviewEncounters: 6
      allowedChallengeTypes:
        - multiple-choice
        - true-false
        - code-prediction
      concepts:
        - nextjs.project-structure
        - nextjs.app-router-introduction
        - nextjs.pages-and-layouts

    - level: 2
      title: Routing Initiate
      description: Dynamic routes, route groups, navigation, and linking
      difficultyRange: { minimum: 2, maximum: 3 }
      requiredMastery: 68
      requiredSuccessfulEncounters: 28
      requiredReviewEncounters: 8
      allowedChallengeTypes:
        - multiple-choice
        - code-prediction
        - bug-hunt
      concepts:
        - nextjs.dynamic-routes
        - nextjs.route-groups
        - nextjs.navigation

    - level: 3
      title: Component Boundaries
      description: Server and client components, rendering boundaries, and composition
      difficultyRange: { minimum: 2, maximum: 4 }
      requiredMastery: 70
      requiredSuccessfulEncounters: 30
      requiredReviewEncounters: 8
      allowedChallengeTypes:
        - multiple-choice
        - code-prediction
        - bug-hunt
        - refactoring
      concepts:
        - nextjs.server-components
        - nextjs.client-components
        - nextjs.composition-patterns

    - level: 4
      title: Data Apprentice
      description: Data fetching, loading states, error handling, and route handlers
      difficultyRange: { minimum: 3, maximum: 4 }
      requiredMastery: 70
      requiredSuccessfulEncounters: 32
      requiredReviewEncounters: 10
      allowedChallengeTypes:
        - code-prediction
        - bug-hunt
        - refactoring
        - explain-it
      concepts:
        - nextjs.data-fetching
        - nextjs.loading-and-error-states
        - nextjs.route-handlers

    - level: 5
      title: Rendering Explorer
      description: Static and dynamic rendering, streaming, and Suspense boundaries
      difficultyRange: { minimum: 3, maximum: 5 }
      requiredMastery: 72
      requiredSuccessfulEncounters: 34
      requiredReviewEncounters: 10
      allowedChallengeTypes:
        - code-prediction
        - bug-hunt
        - refactoring
        - explain-it
        - architecture-decision
      concepts:
        - nextjs.static-rendering
        - nextjs.dynamic-rendering
        - nextjs.streaming
        - nextjs.suspense-boundaries

    - level: 6
      title: Cache Investigator
      description: Caching strategies, revalidation, incremental static regeneration
      difficultyRange: { minimum: 4, maximum: 6 }
      requiredMastery: 73
      requiredSuccessfulEncounters: 36
      requiredReviewEncounters: 12
      allowedChallengeTypes:
        - code-prediction
        - bug-hunt
        - explain-it
        - architecture-decision
      concepts:
        - nextjs.caching
        - nextjs.revalidation
        - nextjs.isr

    - level: 7
      title: Mutation Specialist
      description: Server Actions, form handling, optimistic updates, revalidation
      difficultyRange: { minimum: 4, maximum: 6 }
      requiredMastery: 75
      requiredSuccessfulEncounters: 38
      requiredReviewEncounters: 12
      allowedChallengeTypes:
        - code-prediction
        - bug-hunt
        - refactoring
        - explain-it
        - architecture-decision
      concepts:
        - nextjs.server-actions
        - nextjs.form-handling
        - nextjs.optimistic-updates

    - level: 8
      title: Security Guardian
      description: Authentication, authorization, middleware, and security best practices
      difficultyRange: { minimum: 5, maximum: 7 }
      requiredMastery: 78
      requiredSuccessfulEncounters: 40
      requiredReviewEncounters: 14
      allowedChallengeTypes:
        - bug-hunt
        - refactoring
        - explain-it
        - architecture-decision
      concepts:
        - nextjs.authentication
        - nextjs.authorization
        - nextjs.middleware
        - nextjs.security-best-practices

    - level: 9
      title: Performance Architect
      description: Performance optimization, bundle analysis, image optimization, and fonts
      difficultyRange: { minimum: 6, maximum: 8 }
      requiredMastery: 80
      requiredSuccessfulEncounters: 44
      requiredReviewEncounters: 16
      allowedChallengeTypes:
        - explain-it
        - architecture-decision
        - refactoring
      concepts:
        - nextjs.performance-optimization
        - nextjs.image-optimization
        - nextjs.bundle-analysis

    - level: 10
      title: Production Commander
      description: Deployment, instrumentation, logging, monitoring, and production operations
      difficultyRange: { minimum: 7, maximum: 9 }
      requiredMastery: 82
      requiredSuccessfulEncounters: 48
      requiredReviewEncounters: 18
      allowedChallengeTypes:
        - explain-it
        - architecture-decision
        - refactoring
      concepts:
        - nextjs.deployment
        - nextjs.instrumentation
        - nextjs.logging
        - nextjs.production-operations
---

# Domain: Next.js Level 1 — Foundations

## Concept: Project Structure

### Metadata

- id: nextjs.project-structure
- level: foundation
- difficulty: 1
- prerequisites:
- tags: [nextjs, project-structure]
- outcomes: [Explain Project Structure trade-offs in a production app, Apply Project Structure decisions without breaking App Router behaviour]

### Knowledge

A production Next.js app is organised around route segments, colocated UI, shared server-only modules, and explicit boundaries between app code, domain code, tests, and configuration. The structure should make ownership obvious: route files orchestrate presentation, server actions call application services, and domain modules hold deterministic rules.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: Which statement best describes Project Structure in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Project Structure affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 1
- stem: A team changes Project Structure behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Project Structure is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 1
- stem: A route uses Project Structure and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 1
- prompt: Trace how a change to Project Structure flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Project Structure changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Project Structure is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: App Router Introduction

### Metadata

- id: nextjs.app-router-introduction
- level: foundation
- difficulty: 1
- prerequisites:
- tags: [nextjs, app-router-introduction]
- outcomes: [Explain App Router Introduction trade-offs in a production app, Apply App Router Introduction decisions without breaking App Router behaviour]

### Knowledge

The App Router uses the app directory, React Server Components, layouts, nested routes, loading states, error boundaries, and route handlers. It defaults to server rendering and lets each route segment declare the UI and data boundary it owns.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: Which statement best describes App Router Introduction in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: App Router Introduction affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 1
- stem: A team changes App Router Introduction behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove App Router Introduction is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 1
- stem: A route uses App Router Introduction and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 1
- prompt: Trace how a change to App Router Introduction flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how App Router Introduction changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, App Router Introduction is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Pages And Layouts

### Metadata

- id: nextjs.pages-and-layouts
- level: foundation
- difficulty: 2
- prerequisites:
- tags: [nextjs, pages-and-layouts]
- outcomes: [Explain Pages And Layouts trade-offs in a production app, Apply Pages And Layouts decisions without breaking App Router behaviour]

### Knowledge

A page.tsx file makes a route segment publicly accessible while layout.tsx wraps child segments and persists across navigation. Templates remount for each navigation while layouts keep state and avoid repeated work.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 2
- stem: Which statement best describes Pages And Layouts in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Pages And Layouts affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 2
- stem: A team changes Pages And Layouts behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Pages And Layouts is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 2
- stem: A route uses Pages And Layouts and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 2
- prompt: Trace how a change to Pages And Layouts flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Pages And Layouts changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Pages And Layouts is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 2 — Routing Initiate

## Concept: Dynamic Routes

### Metadata

- id: nextjs.dynamic-routes
- level: foundation
- difficulty: 2
- prerequisites:
- tags: [nextjs, dynamic-routes]
- outcomes: [Explain Dynamic Routes trade-offs in a production app, Apply Dynamic Routes decisions without breaking App Router behaviour]

### Knowledge

Dynamic Routes is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 2
- stem: Which statement best describes Dynamic Routes in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Dynamic Routes affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 2
- stem: A team changes Dynamic Routes behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Dynamic Routes is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 2
- stem: A route uses Dynamic Routes and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 2
- prompt: Trace how a change to Dynamic Routes flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Dynamic Routes changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Dynamic Routes is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Route Groups

### Metadata

- id: nextjs.route-groups
- level: foundation
- difficulty: 2
- prerequisites:
- tags: [nextjs, route-groups]
- outcomes: [Explain Route Groups trade-offs in a production app, Apply Route Groups decisions without breaking App Router behaviour]

### Knowledge

Route Groups is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 2
- stem: Which statement best describes Route Groups in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Route Groups affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 2
- stem: A team changes Route Groups behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Route Groups is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 2
- stem: A route uses Route Groups and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 2
- prompt: Trace how a change to Route Groups flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Route Groups changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Route Groups is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Navigation

### Metadata

- id: nextjs.navigation
- level: foundation
- difficulty: 3
- prerequisites:
- tags: [nextjs, navigation]
- outcomes: [Explain Navigation trade-offs in a production app, Apply Navigation decisions without breaking App Router behaviour]

### Knowledge

Navigation is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 3
- stem: Which statement best describes Navigation in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Navigation affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 3
- stem: A team changes Navigation behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Navigation is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 3
- stem: A route uses Navigation and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 3
- prompt: Trace how a change to Navigation flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Navigation changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Navigation is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 3 — Component Boundaries

## Concept: Server Components

### Metadata

- id: nextjs.server-components
- level: intermediate
- difficulty: 3
- prerequisites:
- tags: [nextjs, server-components]
- outcomes: [Explain Server Components trade-offs in a production app, Apply Server Components decisions without breaking App Router behaviour]

### Knowledge

Server Components is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 3
- stem: Which statement best describes Server Components in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Server Components affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 3
- stem: A team changes Server Components behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Server Components is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 3
- stem: A route uses Server Components and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 3
- prompt: Trace how a change to Server Components flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Server Components changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Server Components is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Client Components

### Metadata

- id: nextjs.client-components
- level: intermediate
- difficulty: 3
- prerequisites:
- tags: [nextjs, client-components]
- outcomes: [Explain Client Components trade-offs in a production app, Apply Client Components decisions without breaking App Router behaviour]

### Knowledge

Client Components is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 3
- stem: Which statement best describes Client Components in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Client Components affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 3
- stem: A team changes Client Components behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Client Components is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 3
- stem: A route uses Client Components and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 3
- prompt: Trace how a change to Client Components flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Client Components changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Client Components is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Composition Patterns

### Metadata

- id: nextjs.composition-patterns
- level: intermediate
- difficulty: 3
- prerequisites:
- tags: [nextjs, composition-patterns]
- outcomes: [Explain Composition Patterns trade-offs in a production app, Apply Composition Patterns decisions without breaking App Router behaviour]

### Knowledge

Composition Patterns is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 3
- stem: Which statement best describes Composition Patterns in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Composition Patterns affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 3
- stem: A team changes Composition Patterns behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Composition Patterns is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 3
- stem: A route uses Composition Patterns and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 3
- prompt: Trace how a change to Composition Patterns flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Composition Patterns changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Composition Patterns is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 4 — Data Apprentice

## Concept: Data Fetching

### Metadata

- id: nextjs.data-fetching
- level: intermediate
- difficulty: 3
- prerequisites:
- tags: [nextjs, data-fetching]
- outcomes: [Explain Data Fetching trade-offs in a production app, Apply Data Fetching decisions without breaking App Router behaviour]

### Knowledge

Data Fetching is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 3
- stem: Which statement best describes Data Fetching in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Data Fetching affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 3
- stem: A team changes Data Fetching behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Data Fetching is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 3
- stem: A route uses Data Fetching and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 3
- prompt: Trace how a change to Data Fetching flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Data Fetching changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Data Fetching is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Loading And Error States

### Metadata

- id: nextjs.loading-and-error-states
- level: intermediate
- difficulty: 4
- prerequisites:
- tags: [nextjs, loading-and-error-states]
- outcomes: [Explain Loading And Error States trade-offs in a production app, Apply Loading And Error States decisions without breaking App Router behaviour]

### Knowledge

Loading And Error States is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 4
- stem: Which statement best describes Loading And Error States in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Loading And Error States affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 4
- stem: A team changes Loading And Error States behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Loading And Error States is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 4
- stem: A route uses Loading And Error States and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 4
- prompt: Trace how a change to Loading And Error States flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Loading And Error States changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Loading And Error States is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Route Handlers

### Metadata

- id: nextjs.route-handlers
- level: intermediate
- difficulty: 4
- prerequisites:
- tags: [nextjs, route-handlers]
- outcomes: [Explain Route Handlers trade-offs in a production app, Apply Route Handlers decisions without breaking App Router behaviour]

### Knowledge

Route Handlers is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 4
- stem: Which statement best describes Route Handlers in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Route Handlers affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 4
- stem: A team changes Route Handlers behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Route Handlers is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 4
- stem: A route uses Route Handlers and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 4
- prompt: Trace how a change to Route Handlers flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Route Handlers changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Route Handlers is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 5 — Rendering Explorer

## Concept: Static Rendering

### Metadata

- id: nextjs.static-rendering
- level: advanced
- difficulty: 4
- prerequisites:
- tags: [nextjs, static-rendering]
- outcomes: [Explain Static Rendering trade-offs in a production app, Apply Static Rendering decisions without breaking App Router behaviour]

### Knowledge

Static Rendering is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 4
- stem: Which statement best describes Static Rendering in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Static Rendering affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 4
- stem: A team changes Static Rendering behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Static Rendering is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 4
- stem: A route uses Static Rendering and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 4
- prompt: Trace how a change to Static Rendering flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Static Rendering changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Static Rendering is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Dynamic Rendering

### Metadata

- id: nextjs.dynamic-rendering
- level: advanced
- difficulty: 4
- prerequisites:
- tags: [nextjs, dynamic-rendering]
- outcomes: [Explain Dynamic Rendering trade-offs in a production app, Apply Dynamic Rendering decisions without breaking App Router behaviour]

### Knowledge

Dynamic Rendering is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 4
- stem: Which statement best describes Dynamic Rendering in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Dynamic Rendering affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 4
- stem: A team changes Dynamic Rendering behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Dynamic Rendering is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 4
- stem: A route uses Dynamic Rendering and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 4
- prompt: Trace how a change to Dynamic Rendering flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Dynamic Rendering changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Dynamic Rendering is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Streaming

### Metadata

- id: nextjs.streaming
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, streaming]
- outcomes: [Explain Streaming trade-offs in a production app, Apply Streaming decisions without breaking App Router behaviour]

### Knowledge

Streaming is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Streaming in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Streaming affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Streaming behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Streaming is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Streaming and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Streaming flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Streaming changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Streaming is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Suspense Boundaries

### Metadata

- id: nextjs.suspense-boundaries
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, suspense-boundaries]
- outcomes: [Explain Suspense Boundaries trade-offs in a production app, Apply Suspense Boundaries decisions without breaking App Router behaviour]

### Knowledge

Suspense Boundaries is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Suspense Boundaries in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Suspense Boundaries affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Suspense Boundaries behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Suspense Boundaries is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Suspense Boundaries and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Suspense Boundaries flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Suspense Boundaries changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Suspense Boundaries is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 6 — Cache Investigator

## Concept: Caching

### Metadata

- id: nextjs.caching
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, caching]
- outcomes: [Explain Caching trade-offs in a production app, Apply Caching decisions without breaking App Router behaviour]

### Knowledge

Caching is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Caching in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Caching affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Caching behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Caching is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Caching and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Caching flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Caching changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Caching is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Revalidation

### Metadata

- id: nextjs.revalidation
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, revalidation]
- outcomes: [Explain Revalidation trade-offs in a production app, Apply Revalidation decisions without breaking App Router behaviour]

### Knowledge

Revalidation is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Revalidation in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Revalidation affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Revalidation behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Revalidation is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Revalidation and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Revalidation flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Revalidation changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Revalidation is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: ISR

### Metadata

- id: nextjs.isr
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, isr]
- outcomes: [Explain ISR trade-offs in a production app, Apply ISR decisions without breaking App Router behaviour]

### Knowledge

ISR is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes ISR in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: ISR affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes ISR behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove ISR is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses ISR and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to ISR flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how ISR changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, ISR is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 7 — Mutation Specialist

## Concept: Server Actions

### Metadata

- id: nextjs.server-actions
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, server-actions]
- outcomes: [Explain Server Actions trade-offs in a production app, Apply Server Actions decisions without breaking App Router behaviour]

### Knowledge

Server Actions is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Server Actions in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Server Actions affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Server Actions behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Server Actions is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Server Actions and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Server Actions flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Server Actions changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Server Actions is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Form Handling

### Metadata

- id: nextjs.form-handling
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, form-handling]
- outcomes: [Explain Form Handling trade-offs in a production app, Apply Form Handling decisions without breaking App Router behaviour]

### Knowledge

Form Handling is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Form Handling in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Form Handling affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Form Handling behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Form Handling is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Form Handling and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Form Handling flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Form Handling changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Form Handling is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Optimistic Updates

### Metadata

- id: nextjs.optimistic-updates
- level: advanced
- difficulty: 5
- prerequisites:
- tags: [nextjs, optimistic-updates]
- outcomes: [Explain Optimistic Updates trade-offs in a production app, Apply Optimistic Updates decisions without breaking App Router behaviour]

### Knowledge

Optimistic Updates is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Optimistic Updates in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Optimistic Updates affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Optimistic Updates behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Optimistic Updates is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Optimistic Updates and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Optimistic Updates flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Optimistic Updates changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Optimistic Updates is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 8 — Security Guardian

## Concept: Authentication

### Metadata

- id: nextjs.authentication
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, authentication]
- outcomes: [Explain Authentication trade-offs in a production app, Apply Authentication decisions without breaking App Router behaviour]

### Knowledge

Authentication is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Authentication in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Authentication affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Authentication behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Authentication is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Authentication and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Authentication flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Authentication changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Authentication is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Authorization

### Metadata

- id: nextjs.authorization
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, authorization]
- outcomes: [Explain Authorization trade-offs in a production app, Apply Authorization decisions without breaking App Router behaviour]

### Knowledge

Authorization is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Authorization in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Authorization affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Authorization behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Authorization is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Authorization and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Authorization flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Authorization changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Authorization is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Middleware

### Metadata

- id: nextjs.middleware
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, middleware]
- outcomes: [Explain Middleware trade-offs in a production app, Apply Middleware decisions without breaking App Router behaviour]

### Knowledge

Middleware is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Middleware in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Middleware affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Middleware behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Middleware is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Middleware and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Middleware flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Middleware changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Middleware is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Security Best Practices

### Metadata

- id: nextjs.security-best-practices
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, security-best-practices]
- outcomes: [Explain Security Best Practices trade-offs in a production app, Apply Security Best Practices decisions without breaking App Router behaviour]

### Knowledge

Security Best Practices is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Security Best Practices in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Security Best Practices affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Security Best Practices behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Security Best Practices is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Security Best Practices and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Security Best Practices flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Security Best Practices changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Security Best Practices is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 9 — Performance Architect

## Concept: Performance Optimization

### Metadata

- id: nextjs.performance-optimization
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, performance-optimization]
- outcomes: [Explain Performance Optimization trade-offs in a production app, Apply Performance Optimization decisions without breaking App Router behaviour]

### Knowledge

Performance Optimization is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Performance Optimization in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Performance Optimization affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Performance Optimization behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Performance Optimization is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Performance Optimization and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Performance Optimization flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Performance Optimization changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Performance Optimization is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Image Optimization

### Metadata

- id: nextjs.image-optimization
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, image-optimization]
- outcomes: [Explain Image Optimization trade-offs in a production app, Apply Image Optimization decisions without breaking App Router behaviour]

### Knowledge

Image Optimization is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Image Optimization in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Image Optimization affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Image Optimization behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Image Optimization is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Image Optimization and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Image Optimization flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Image Optimization changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Image Optimization is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Bundle Analysis

### Metadata

- id: nextjs.bundle-analysis
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, bundle-analysis]
- outcomes: [Explain Bundle Analysis trade-offs in a production app, Apply Bundle Analysis decisions without breaking App Router behaviour]

### Knowledge

Bundle Analysis is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Bundle Analysis in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Bundle Analysis affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Bundle Analysis behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Bundle Analysis is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Bundle Analysis and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Bundle Analysis flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Bundle Analysis changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Bundle Analysis is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

# Domain: Next.js Level 10 — Production Commander

## Concept: Deployment

### Metadata

- id: nextjs.deployment
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, deployment]
- outcomes: [Explain Deployment trade-offs in a production app, Apply Deployment decisions without breaking App Router behaviour]

### Knowledge

Deployment is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Deployment in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Deployment affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Deployment behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Deployment is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Deployment and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Deployment flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Deployment changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Deployment is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Instrumentation

### Metadata

- id: nextjs.instrumentation
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, instrumentation]
- outcomes: [Explain Instrumentation trade-offs in a production app, Apply Instrumentation decisions without breaking App Router behaviour]

### Knowledge

Instrumentation is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Instrumentation in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Instrumentation affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Instrumentation behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Instrumentation is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Instrumentation and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Instrumentation flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Instrumentation changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Instrumentation is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Logging

### Metadata

- id: nextjs.logging
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, logging]
- outcomes: [Explain Logging trade-offs in a production app, Apply Logging decisions without breaking App Router behaviour]

### Knowledge

Logging is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Logging in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Logging affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Logging behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Logging is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Logging and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Logging flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Logging changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Logging is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```

## Concept: Production Operations

### Metadata

- id: nextjs.production-operations
- level: senior
- difficulty: 5
- prerequisites:
- tags: [nextjs, production-operations]
- outcomes: [Explain Production Operations trade-offs in a production app, Apply Production Operations decisions without breaking App Router behaviour]

### Knowledge

Production Operations is a production Next.js App Router capability that affects routing, rendering, persistence, or operational behaviour. It must be connected through deterministic application services, verified with real tests, and kept separate from presentation-only UI state.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 5
- stem: Which statement best describes Production Operations in a production Next.js App Router application?
- options: ["It is only a styling concern with no routing impact", "It is a deterministic framework feature that should be wired through server-side application logic when state matters", "It only works when every component is a Client Component", "It should be hidden in AI prompts instead of tested"]
- correctIndex: 1
- explanation: Production Operations affects real application behaviour and should be implemented through deterministic Next.js and application-layer code, then covered by tests.

**seed-002**:

- type: multiple-choice
- difficulty: 5
- stem: A team changes Production Operations behaviour and the UI still renders, but persisted game state is wrong. What is the best next step?
- options: ["Accept it because the page is visible", "Add a real integration or E2E assertion against the persisted state", "Move the logic into a React component", "Disable the failing test"]
- correctIndex: 1
- explanation: Frontend Realms requires real persistence checks; UI visibility alone does not prove Production Operations is connected to the game loop.

**seed-003**:

- type: code-prediction
- difficulty: 5
- stem: A route uses Production Operations and calls an application service before rendering. What should happen if the service reports missing authenticated progress?
- options: ["Silently render fake fixture data", "Block or redirect with an actionable state", "Generate random questions in the browser", "Mark the level complete"]
- correctIndex: 1
- explanation: Missing authenticated progress is real state. The app should block or guide the player, not fake progress or mutate unrelated systems.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 5
- prompt: Trace how a change to Production Operations flows from route input through application service, persistence, and UI feedback.
- solution: Identify the server boundary, application use case, repository write, raw database state, and visible UI update.

### Interview Prompts

**interview-001**:

- prompt: Explain how Production Operations changes architecture, testing, and production behaviour in an App Router codebase.
- evaluationCriteria: [Names the relevant App Router primitive, Explains server/client boundary implications, Describes a real test that would fail if it broke]

### Common Misconceptions

- "If the page renders, Production Operations is working" — Rendering can pass while persistence or progression is disconnected.
- "Next.js should decide gameplay progression automatically" — Domain and application services own deterministic rules.
- "Client UI checks are enough" — Auth, authorization, and state transitions need server-side verification.

### Examples

```tsx
export default async function Page() {
  const result = await loadConnectedState();
  if (!result.ok) return <ActionableEmptyState reason={result.reason} />;
  return <ConnectedView model={result.model} />;
}
```
