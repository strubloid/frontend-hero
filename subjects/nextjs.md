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
