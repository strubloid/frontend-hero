---
id: nextjs
title: Next.js
version: 1
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

# Domain: JavaScript Foundations

## Concept: javascript.event-loop

### Metadata

- id: javascript.event-loop
- level: foundation
- difficulty: 2
- prerequisites:
- tags: [async, event-loop, concurrency]
- outcomes: [Predict JavaScript execution order confidently, Optimise async code using microtask and macrotask awareness]

### Knowledge

The event loop is the core mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and task queues, moving callbacks from queues to the stack when the stack is empty.

Microtasks (Promise callbacks, queueMicrotask, MutationObserver) are processed before macrotasks (setTimeout, setInterval, DOM events, I/O). Each macrotask execution cycle processes one task, then drains the entire microtask queue before rendering or the next macrotask.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: Given `console.log(1); setTimeout(() => console.log(2), 0); console.log(3);`, what is the output?
- options: ["2, 1, 3", "1, 3, 2", "1, 2, 3", "3, 1, 2"]
- correctIndex: 1
- explanation: setTimeout schedules a macrotask, so it runs after the synchronous code finishes. The synchronous log(1) and log(3) execute first in order, then the macrotask fires and logs 2.

**seed-002**:

- type: multiple-choice
- difficulty: 2
- stem: After a Promise resolves, when does its `.then()` callback execute?
- options: ["Immediately, synchronously after the resolve() call", "In the next macrotask", "In the microtask queue, before the next macrotask", "During the next rendering cycle"]
- correctIndex: 2
- explanation: Promise .then() callbacks are microtasks. They execute after the current synchronous code finishes and before the next macrotask is processed.

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 2
- prompt: Trace the output of a program combining setTimeout, Promise, and async/await.
- solution: Understand the execution order: synchronous code → microtasks (Promise callbacks) → macrotasks (setTimeout).

### Interview Prompts

**interview-001**:

- prompt: Explain how the event loop enables non-blocking I/O in a single-threaded JavaScript runtime and describe the microtask/macrotask distinction.
- evaluationCriteria: [Describes call stack and event loop correctly, Distinguishes microtasks from macrotasks, Provides concrete execution order example]

### Common Misconceptions

- "setTimeout(fn, 0) runs after exactly 0 milliseconds" — It enqueues a task with a minimum delay, not an immediate execution.
- "Promises are synchronous" — Promise constructors execute synchronously, but `.then()` callbacks are always async (microtask).
- "The event loop is only used for async/await" — The event loop governs all asynchronous behaviour, not just promises and async/await.

### Examples

```js
console.log("start");
Promise.resolve().then(() => console.log("microtask"));
setTimeout(() => console.log("macrotask"), 0);
console.log("end");
// Output: start, end, microtask, macrotask
```

# Domain: React Foundations

## Concept: react.component-composition

### Metadata

- id: react.component-composition
- level: foundation
- difficulty: 1
- prerequisites:
- tags: [composition, architecture, reusability]
- outcomes: [Design component trees respecting server/client boundaries, Use composition patterns to improve code organisation]

### Knowledge

Component composition is the practice of building complex UIs by combining smaller, focused components. In Next.js, this pattern is especially important because of the server/client component boundary — server components can compose client components, but not vice versa.

The `children` prop pattern, slot-based layouts, and component delegation are the primary composition mechanisms. Good composition leads to better reusability, testability, and performance optimisation opportunities.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: What is the primary benefit of component composition in React?
- options: ["It eliminates the need for state management", "It allows building complex UIs from small, reusable pieces", "It automatically improves application performance", "It removes the need for prop drilling"]
- correctIndex: 1
- explanation: Component composition lets developers build complex interfaces by combining small, focused components, improving reusability and maintainability.

**seed-002**:

- type: multiple-choice
- difficulty: 1
- stem: In Next.js, can a Client Component compose a Server Component?
- options: ["Yes, always", "No, Client Components cannot directly compose Server Components", "Only if the Server Component is wrapped in a Suspense boundary", "Only in development mode"]
- correctIndex: 1
- explanation: Client Components cannot import and compose Server Components directly. Server Components can compose Client Components, but not the reverse. Server Components can be passed as children to Client Components via the `children` prop.

### Practical Challenges

**challenge-001**:

- type: refactoring
- difficulty: 2
- prompt: Refactor a monolithic component into smaller composed components respecting the server/client boundary.
- solution: Split the component at natural boundaries, keep server components for data fetching and static content, client components for interactivity.

### Interview Prompts

**interview-001**:

- prompt: How does component composition differ between server and client components in Next.js? What patterns do you use to work around the constraints?
- evaluationCriteria: [Understands server/client boundary constraints, Describes children prop pattern for cross-boundary composition, Mentions slot/layout patterns]

### Common Misconceptions

- "Composition means more files = better" — Good composition balances granularity with pragmatism; too many tiny components create unnecessary complexity.
- "Server components and client components compose identically" — They don't; the server/client boundary creates directional constraints.

### Examples

```tsx
function Layout({ children }: { children: React.ReactNode }) {
  return <div className="layout">{children}</div>;
}
```
