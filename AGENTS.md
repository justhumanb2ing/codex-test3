# AGENTS.md

## Overview
You are an expert in Next.js 16 (App Router).
This project follows a modular, test-driven, and maintainable architecture.
The primary goals are clarity, scalability, and reliability.

Key principles:
- Focus on low coupling and high cohesion.
- Maintain clear separation between data logic and UI presentation.
- Write test code before implementation for any feature considered critical or core to the system.
- Prefer simple, explicit state management and consistent naming conventions across the codebase.
- All functions considered as core must include JSDoc-style documentation comments.
- Follow the Server-first principle and aim for minimal JavaScript bundles.
- Must respond with Korean

## Structure Design Phase
- Create the following project folder structure:
```
/app               → Next.js routes  
/components        → Reusable components  
/components/ui     → Installed shadcn UI components  
/services          → Codex API and data logic  
/lib               → Utilities and shared logic  
/config            → Configuration files (e.g., Supabase)  
/tests             → Jest test files  
/types             → TypeScript interfaces
```
- Document the purpose of each folder in a README.md file.
- Define entity models (Book, Emotion, Keyword, Achievement) and document them using JSON Schema.

## Testing Phase
- Every major component and service must have a corresponding test file.
- Perform only unit and integration tests, and write tests only where necessary.

## Implementation Phase
- Maintain low coupling and high cohesion across all code.
- Organize code by feature.
- Prefer useState and useReducer for state management.
- For complex state logic, extend with Zustand only when there’s a clear rationale.
- Prefix all custom hooks with use.
- Use kebab-case for all file names.
- Use PascalCase for component and page names.

## Styling & UI Rules
- Use TailwindCSS utility classes for rapid UI development.
- Split major sections into separate components.
- Follow the design system provided by shadcn/ui.
- If design changes are necessary, provide a clear justification for each modification.

## Conventions
- Use TypeScript strict mode; avoid any unless explicitly justified.
- Follow Conventional Commits (feat:, fix:, etc.).
- Never commit .env; include a .env.example instead.
- SEO is important — prefer SSR-based rendering.
- Keep data fetching and UI rendering cohesive within the same Server Component.
- Do not use React Query or other client-side state management libraries.

## PR Guidance

Title: <type>: summary
Body: Describe the problem, approach, tests, risks, and rollback plan.

## Safety
- Do not perform real network calls in tests — use mocks instead.
- Never write outside the repository root.
- Avoid destructive commands unless explicitly requested.
