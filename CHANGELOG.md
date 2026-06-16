# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [1.0.2]

### Documentation
- Improved README with full feature, command, setting, and development documentation.
- Added a complete, structured changelog.
- Added a contributing doc.

## [1.0.1] - 2026-06-16

### Added
- Status bar XP indicator with clickable stats action.
- Command set for stats, configuration, toggles, and XP reset.
- Configurable settings for XP multiplier, info messages, and status bar confetti.
- Level-up celebration flow with optional info message and confetti.

### Changed
- XP progression based on a RuneScape-style level curve.
- XP gain is tied to meaningful save activity with configurable multiplier support.

### Security
- Added anti-farming behavior with duplicate-content detection and time-window checks.
- Added ignored file/path rules to reduce generated-file XP inflation.
- Added minimum and maximum counted change constraints to normalize XP gains.

## [1.0.0] - 2026-06-16

### Added
- Initial release of `vscode-xp`.
