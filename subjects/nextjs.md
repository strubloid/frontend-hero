---
id: nextjs
title: Next.js
version: 1
schemaVersion: 1
description: Senior-level Next.js learning path
minimumGameVersion: 1.0.0
---

# Domain: JavaScript Foundations

## Concept: Event Loop

### Metadata

- id: javascript.event-loop
- level: foundation
- difficulty: 2
- prerequisites:
  - javascript.call-stack
  - javascript.promises
- tags:
  - javascript
  - asynchronous
  - interview
- outcomes:
  - Explain the call stack
  - Distinguish microtasks from macrotasks
  - Predict asynchronous execution order

### Knowledge

The JavaScript event loop is the mechanism that allows JavaScript's single-threaded runtime to handle asynchronous operations without blocking. It continuously checks the call stack and task queues.

**Call stack**: Where synchronous code executes. Functions are pushed onto the stack when called and popped when they return.

**Microtask queue (job queue)**: Higher priority than macrotasks. Populated by Promise.then/catch/finally, queueMicrotask, MutationObserver. After each macrotask, the event loop processes ALL microtasks before the next macrotask.

**Macrotask queue (task queue)**: Populated by setTimeout, setInterval, setImmediate, I/O callbacks, UI rendering. One macrotask is processed per event loop iteration.

**Execution order**: Synchronous code → all microtasks → next macrotask → all microtasks → ...

### Common Misconceptions

- `setTimeout(cb, 0)` does NOT execute immediately — it's queued as a macrotask after all synchronous and microtask work
- Promises are NOT fully synchronous — `.then()` callbacks are microtasks
- The event loop is not part of ECMAScript spec — it's an implementation detail of hosting environments (browsers, Node.js)

### Examples

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1, 4, 3, 2
```

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: "What is the output of: console.log('a'); setTimeout(() => console.log('b'), 0); Promise.resolve().then(() => console.log('c')); console.log('d');"
- options: ["a, b, c, d", "a, d, c, b", "a, d, b, c", "d, a, c, b"]
- correctIndex: 1
- explanation: "Synchronous code (a, d) runs first. Then microtasks (Promise.then → c). Then macrotasks (setTimeout → b)."

**seed-002**:

- type: multiple-choice
- difficulty: 2
- stem: "After a macrotask completes, what does the event loop process next?"
- options: ["The next macrotask", "The entire microtask queue", "One microtask", "UI rendering"]
- correctIndex: 1
- explanation: "After each macrotask, the event loop processes ALL microtasks before moving to the next macrotask."

### Practical Challenges

**challenge-001**:

- type: code-prediction
- difficulty: 2
- prompt: "Given nested promises and timeouts, predict the execution order."
- solution: "Detailed explanation of microtask vs macrotask processing"

### Interview Prompts

**interview-001**:

- prompt: "Explain the event loop to a junior developer. Cover call stack, task queues, and the distinction between microtasks and macrotasks."
- evaluationCriteria: ["Accuracy", "Clarity", "Example quality", "Scope appropriate to audience"]

### Validation Rules

- No infinite loops in example code
- Examples must produce deterministic output

# Domain: React Foundations

## Concept: Component Composition

### Metadata

- id: react.component-composition
- level: foundation
- difficulty: 1
- prerequisites: []
- tags:
  - react
  - components
  - composition
- outcomes:
  - Explain component composition over inheritance
  - Create reusable component hierarchies
  - Understand children and slots patterns

### Knowledge

Component composition is the practice of building complex UIs by combining smaller, focused components. React encourages composition over inheritance.

**Children prop**: Pass JSX elements between opening and closing tags, received as `props.children`.

**Slot pattern**: Use named props to pass JSX to specific locations within a component.

**Container vs Presentational**: Separate data-fetching (container) from rendering (presentational) components.

### Question Seeds

**seed-001**:

- type: multiple-choice
- difficulty: 1
- stem: "Which pattern does React recommend over inheritance for code reuse?"
- options: ["Mixins", "Component composition", "Higher-order components only", "Class inheritance"]
- correctIndex: 1
- explanation: "React recommends composition — building components from smaller components — over inheritance."

**seed-002**:

- type: multiple-choice
- difficulty: 1
- stem: "What does `props.children` contain?"
- options: ["The component's state", "JSX passed between opening and closing tags", "The component's class methods", "The component's refs"]
- correctIndex: 1
- explanation: "props.children contains any JSX or elements passed between the component's opening and closing tags."
