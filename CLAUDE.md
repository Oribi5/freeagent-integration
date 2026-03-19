# Engineering Playbook

## Purpose

This document defines **mandatory engineering standards** for development, testing, and architecture. Its goal is to ensure consistency, reliability, and high development velocity while minimizing operational risk and technical debt.

These rules are **non-negotiable** unless explicitly agreed otherwise.

---

## 1. Development Workflow Standards

### 1.1 tmux Requirement (Mandatory)

All development servers and long‑running processes **must** run inside tmux sessions.

**Never run development servers directly in a terminal or background process.**

#### Forbidden

```bash
npm run dev
npm run dev &
```

#### Required

```bash
tmux new-session -d -s dev 'npm run dev'
tmux capture-pane -t dev -p | tail -10
```

#### Standard Startup Procedure

1. Kill existing dev servers:

   ```bash
   pkill -f "next dev"
   ```
2. Start dev server in tmux:

   ```bash
   tmux new-session -d -s dev 'npm run dev'
   ```
3. Verify startup:

   ```bash
   tmux capture-pane -t dev -p | head -10
   ```

#### Mandatory Restart After Build

After running `npm run build`, the dev server **must be restarted** to avoid stale manifests and runtime errors.

```bash
tmux kill-session -t dev
tmux new-session -d -s dev 'npm run dev'
```

**Rationale**

* Persistent sessions
* Non‑blocking workflows
* Log correlation with test failures
* Stable hot‑reload behavior

---

### 1.2 Temporary Files Policy

All temporary artifacts **must** live in `/temp` and be removed after use.

#### Required Structure

```bash
mkdir -p temp

temp/test-script.js
temp/screenshots/
temp/screenshots/grid-view.png

temp/
```

#### Cleanup (Mandatory)

```bash
rm -rf temp/
```

**Rationale**

* Prevents accidental commits
* Keeps repository clean
* Makes testing artifacts explicit and disposable

---

### 1.3 Repository Knowledge Base (`claude_docs/`)

Local, gitignored folder for storing repository-level context — architecture decisions, active initiatives, domain knowledge, service maps, etc.

**Location**: `/claude_docs/` at repo root

#### Structure

Organized by topic for fast retrieval:

```
claude_docs/
  architecture.md      — system architecture, service boundaries, data flow
  initiatives.md       — active and completed initiatives, migration status
  domain.md            — domain concepts, entity relationships, business rules
  services.md          — service directory, API contracts, integration notes
  decisions.md         — key technical decisions and rationale (lightweight ADRs)
```

#### Rules

* Must be gitignored — never committed
* Files should be concise and scannable (headers, bullet points, no prose)
* Update docs as part of completing work — treat knowledge capture as part of the task
* Before starting a task, consult relevant `claude_docs/` files for existing context
* Create new topic files as needed, but prefer updating existing ones over creating new files

---

### 1.4 Pre-Task Context

Before starting any task, check `claude_docs/` for relevant context about
the service, architecture, or conventions involved.

### 1.5 Post-Task Documentation

After completing a task, evaluate whether `claude_docs/` needs updating
with new patterns, decisions, or service context. Ask permission before
updating documentation.

---

## 2. Architectural Principles

### 2.1 General Engineering Rules

* Prefer **minimal, scoped changes**
* Favor **readability over cleverness**
* Extract small, reusable functions
* Avoid classes unless strictly necessary
* Never refactor outside the requested scope

---

## 3. Domain‑Driven Structure

### 3.1 Entity–Action Model (Mandatory)

All development follows a standardized entity‑action model.

#### Entities

Core domain objects (e.g. `Team`, `Member`, `Project`).

#### Standard Actions

Every entity supports:

* Index
* Show
* Create
* Edit
* Delete

This model applies consistently across:

* APIs
* Frontend pages
* Tests

---

### 3.2 Relationships

Many‑to‑many relationships **must** use explicit relationship entities.

**Example**

* `TeamMember`

  * Create → add member
  * Delete → remove member

**Do not create bespoke endpoints** such as `/teams/add-member`.

---

### 3.3 Complex Workflows

Map compound operations to standard actions:

* Duplicate entity → Show + Create
* Bulk removal → Index + Delete
* Promotion → Edit entity attributes

Avoid custom endpoints unless they introduce genuine domain meaning.

---

## 4. TypeScript Standards

### 4.1 Typing Rules

* No type assertions (`as`) in component code
* Allowed exceptions:

  * `as const`
  * Fully validated type guards

#### Required Practices

* Explicit return types on all functions
* JSDoc comments on all functions
* Prefer verbose, descriptive variable names
* Static imports only (no `await import()`)

---

### 4.2 Conditional Expressions

* **Discourage ternary operators.** Prefer `if`/`else` statements for clarity.
* **Nested ternaries are strictly forbidden.** No exceptions.

---

### 4.3 Code Extraction (Mandatory)

If a block of code is cohesive enough that you would add a comment explaining what the next few lines do, **extract it into a named helper function or component instead.**

* Extraction should be **aggressive and consistent**
* Prefer many small, well‑named functions over fewer large ones
* Apply at every level: utilities, service helpers, data transforms

---

### 4.4 Polymorphism

* Use discriminated unions or function overloads
* Never inline `switch` logic in components
* Delegate behavior to dedicated helpers or renderers

---

## 5. Code Quality Enforcement

Before completing any task, always run:

```bash
npm run build
npm run lint
```

TypeScript validation occurs during build.

---

## 6. Verification & Debugging

### 6.1 Mandatory Verification

Before implementing changes:

* Verify the reported issue exists
* Inspect code, logs, or runtime behavior
* Do not implement speculative fixes

---

### 6.2 Systematic Debugging

Use progressive isolation:

1. Reproduce the full flow
2. Isolate failing components
3. Add targeted logging
4. Compare expected vs actual behavior
5. Validate async boundaries

---

## Enforcement

All engineers are expected to follow this playbook. Deviations must be deliberate, reviewed, and documented.
