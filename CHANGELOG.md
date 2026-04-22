# Changelog

All notable changes to the TaskOn Embed SDK will be documented in this file.

## [1.2.3] - 2026-04-22

### Added

- Detect and proxy `window.topnod` (TopNod) as a white-label wallet provider

## [1.2.2] - 2026-03-03

### Changed

- Normalize `baseUrl` during initialization (host-only, protocol auto-fill, trailing slash tolerance)

## [1.2.1] - 2025-01-22

### Added

- Add `tabsInclude` and `tabsExclude` config options to control community tab visibility

## [1.1.0] - 2025-10-23

### Added

- Add `bindConflict` event for white-label mode binding conflicts
- Add `BindConflictData` type with `email`, `bindType`, `snsType?`, `address?` fields
- Add `onBindConflict` method to `PenpalParentMethods`

## [1.0.0]

Initial stable release of TaskOn Embed SDK.
