## ADDED Requirements

### Requirement: Configurable native terminal panel location
The extension SHALL provide a configuration key `clihub.nativeTerminalLocation` with values `panel` and `right`.

#### Scenario: Default panel behavior
- **WHEN** the user has not changed `clihub.nativeTerminalLocation`
- **THEN** CLI Hub opens or reuses native terminal sessions without forcing a panel layout change

#### Scenario: Force panel to the right
- **WHEN** `clihub.nativeTerminalLocation` is `right`
- **AND** the user opens or reuses a CLI Hub terminal session
- **THEN** the extension executes the VS Code command that positions the panel on the right side
- **AND** the terminal session remains in native panel mode
