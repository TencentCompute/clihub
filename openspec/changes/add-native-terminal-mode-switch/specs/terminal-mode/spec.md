## ADDED Requirements
### Requirement: Terminal open mode is configurable
The system SHALL provide a configuration key `clihub.terminalOpenMode` with values `native` and `editor`.

#### Scenario: Native mode opens in panel terminal
- **WHEN** `clihub.terminalOpenMode` is `native` and the user runs `clihub.openTerminalEditor`
- **THEN** the extension opens or reuses a VS Code native terminal panel session
- **AND** the extension does not require Terminal Editor placement for that session

#### Scenario: Editor mode keeps terminal editor behavior
- **WHEN** `clihub.terminalOpenMode` is `editor` and the user runs `clihub.openTerminalEditor`
- **THEN** the extension opens or reuses a Terminal Editor session with the existing editor-side behavior

### Requirement: Native panel can be positioned to the right automatically
The system SHALL provide a boolean configuration key `clihub.moveNativeTerminalToRight` that controls right-side placement for native terminal mode.

#### Scenario: Auto move native panel to right is enabled
- **WHEN** `clihub.terminalOpenMode` is `native`
- **AND** `clihub.moveNativeTerminalToRight` is `true`
- **THEN** the extension repositions the VS Code panel to the right before or during terminal reveal

#### Scenario: Auto move native panel to right is disabled
- **WHEN** `clihub.terminalOpenMode` is `native`
- **AND** `clihub.moveNativeTerminalToRight` is `false`
- **THEN** the extension opens or reuses native terminal without forcing panel position changes

### Requirement: Default behavior prefers native right-side terminal
The system SHALL default to `clihub.terminalOpenMode = native` and `clihub.moveNativeTerminalToRight = true`.

#### Scenario: User uses defaults without custom settings
- **WHEN** no workspace/user overrides exist for the new terminal mode settings
- **THEN** `clihub.openTerminalEditor` opens in native terminal mode
- **AND** the panel is moved to the right automatically

### Requirement: Send-path command works in both terminal modes
The system SHALL preserve `clihub.sendPathToTerminal` behavior across `native` and `editor` modes.

#### Scenario: Send path with no existing terminal in native mode
- **WHEN** `clihub.terminalOpenMode` is `native`
- **AND** the user runs `clihub.sendPathToTerminal` without an existing tracked terminal
- **THEN** the extension opens a native terminal session and sends the target payload

#### Scenario: Send path with no existing terminal in editor mode
- **WHEN** `clihub.terminalOpenMode` is `editor`
- **AND** the user runs `clihub.sendPathToTerminal` without an existing tracked terminal
- **THEN** the extension opens an editor terminal session and sends the target payload
