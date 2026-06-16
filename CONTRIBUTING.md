# Contributing

Thanks for your interest in contributing to `vscode-xp`.

This guide explains how to propose changes, run the project locally, and submit clean pull requests.

## Table of Contents

- Development Setup
- Project Structure
- Making Changes
- Coding Guidelines
- Manual Testing Checklist
- Pull Request Process
- Release Notes and Changelog

## Development Setup

### Prerequisites

- Node.js (LTS recommended)
- npm
- VS Code 1.70+

### Install dependencies

```bash
npm install
```

### Build and type-check

```bash
npm run bundle
```

### Watch mode during development

```bash
npm run watch
```

### Create a `.vsix` package

```bash
npm run package
```

Output is written to the `versions/` directory.

## Project Structure

- `src/extension.ts`: activation, command registration, save/change hooks
- `src/state.ts`: extension state/config persistence
- `src/xp.ts`: XP/level math and progress rendering helpers
- `src/ui.ts`: stats popup and status bar UI helpers
- `src/constants.ts`: shared constants and thresholds
- `README.md`: user-facing extension documentation
- `CHANGELOG.md`: release history

## Making Changes

1. Fork the repository and create a branch from `main`.
2. Keep each branch focused on one change set (feature, fix, docs, cleanup).
3. Run `npm run bundle` before opening a pull request.
4. If behavior or UX changes, update `README.md`.
5. Add an entry to `CHANGELOG.md` under `Unreleased`.

## Coding Guidelines

- Use TypeScript strict mode-compatible code.
- Keep functions small and purpose-driven.
- Prefer explicit names over short ambiguous names.
- Avoid adding dependencies unless clearly justified.
- Keep status bar behavior lightweight and non-blocking.
- Preserve existing command IDs and settings keys to avoid breaking users.

## Manual Testing Checklist

Because this project currently relies mostly on manual validation, test these scenarios before submitting:

1. Extension activates correctly on startup.
2. Status bar item appears and updates after saving changed files.
3. XP is not awarded for tiny edits below threshold.
4. XP multiplier setting changes XP gain as expected.
5. `Show XP Stats` command opens expected details.
6. `Configure XP Settings` saves and applies values.
7. `Toggle Info Messages` and `Toggle Status Bar Confetti` work.
8. `Reset XP bar` resets stats only after `CONFIRM`.
9. Ignored files/folders do not grant XP.

If possible, include screenshots or short recordings for UI-related changes.

## Pull Request Process

When opening a PR, include:

- Clear title describing the change
- Short summary of what changed and why
- Testing notes (what you validated)
- Any follow-up tasks or known limitations

Small, focused PRs are preferred over large mixed changes.

## Release Notes and Changelog

- Add user-visible changes to `CHANGELOG.md` under `Unreleased`.
- Use categories when possible: `Added`, `Changed`, `Fixed`, `Security`, `Documentation`.
- Keep entries concise and action-oriented.

## Questions

If you are unsure about an implementation direction, open an issue first so we can align before large changes.