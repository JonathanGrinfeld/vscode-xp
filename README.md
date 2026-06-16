# vscode-xp

Earn XP as you code in VS Code.

`vscode-xp` adds a live XP/level indicator to your status bar and awards XP when you save meaningful file changes. It is lightweight, configurable, and designed to reward real work while reducing easy XP farming.

## Features

- Status bar level indicator (`LVL N`) with live XP progress
- XP earned on file save when enough changes were made
- RuneScape-style level curve for progression
- Optional level-up info messages
- Optional status bar confetti celebration on level-up
- Quick commands for stats, settings, toggles, and reset

## How XP Is Earned

XP is awarded when you save a document and all of these conditions pass:

1. The file is not ignored by built-in filters.
2. The save contains at least 5 accumulated text-change units.
3. The saved content is not considered a duplicate of very recent content.

XP formula per save:

- `effectiveChanges = min(changes, 2500)`
- `baseXp = ceil(effectiveChanges / 10)`
- `gainedXp = ceil(baseXp * xpMultiplier)`

This keeps rewards proportional to effort while preventing extreme spikes.

## Anti-Farming Safeguards

The extension includes several protections to keep progression fair:

- Minimum change threshold before XP is awarded
- Per-save change cap (`2500`)
- Duplicate-content cooldown window (`2 minutes`)
- Ignored files and folders (for generated/bulk files)

Ignored by default includes common lockfiles and paths such as:

- `node_modules`, `dist`, `build`, `coverage`, `.next`, `out`, `target`
- lockfiles like `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- minified and sourcemap files (`*.min.js`, `*.map`)

But you can always change the xp multiplier if you feel like it
## Commands

Open the Command Palette and run:

- `vscode-xp: Show XP Stats`
- `vscode-xp: Configure XP Settings`
- `vscode-xp: Toggle Info Messages`
- `vscode-xp: Toggle Status Bar Confetti`
- `vscode-xp: Reset XP bar`

## Settings

All settings live under the `vscode-xp` namespace:

- `vscode-xp.xpMultiplier` (`number`, default: `1`, min: `0.1`, max: `100`)
- `vscode-xp.showInfoMessages` (`boolean`, default: `true`)
- `vscode-xp.showStatusBarConfetti` (`boolean`, default: `true`)

## Installation

Install from the VS Code Marketplace and reload the editor if prompted.

After activation:

1. Start editing files normally.
2. Save meaningful changes.
3. Watch your level progress in the status bar.

## Known Notes

- XP is awarded on save, not on each keystroke.
- Unsaved/untitled documents do not grant XP.
- Progress and config are persisted globally by the extension.

## License

MIT