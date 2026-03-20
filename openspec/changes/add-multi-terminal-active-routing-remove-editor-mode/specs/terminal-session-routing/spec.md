## ADDED Requirements

### Requirement: Multiple CLI Hub terminal sessions
The extension SHALL support multiple concurrent CLI Hub terminal sessions in native terminal panel mode.

#### Scenario: User creates parallel sessions
- **WHEN** the user executes `clihub.openNewTerminalSession` multiple times
- **THEN** the extension creates a new CLI Hub terminal session each time
- **AND** each created terminal is tracked as an independent session

### Requirement: Active-session-first routing for send command
The extension SHALL route path/selection payloads to the active CLI Hub terminal session first.

#### Scenario: Active CLI Hub terminal exists
- **WHEN** `clihub.sendPathToTerminal` is executed
- **AND** the currently active terminal is a CLI Hub session for the selected tool
- **THEN** the payload is sent to that active terminal

#### Scenario: No active matching session
- **WHEN** `clihub.sendPathToTerminal` is executed
- **AND** no active CLI Hub terminal matches the selected tool
- **THEN** the extension uses the most recently active matching CLI Hub session
- **AND** if none exists, creates a new session and sends the payload

### Requirement: Tool switch in active terminal session
The extension SHALL switch CLI tool inside the active CLI Hub terminal when possible.

#### Scenario: Active CLI Hub terminal during tool switch
- **WHEN** the user changes tool via `clihub.switchAITool`
- **AND** the currently active terminal is a CLI Hub terminal
- **THEN** the extension sends switch commands in that terminal to start the newly selected CLI
- **AND** the terminal itself remains open

## REMOVED Requirements

### Requirement: Terminal editor mode switching
**Reason**: Reduce complexity and focus on native multi-session flow.

**Migration**: Existing users with `clihub.terminalOpenMode=editor` are auto-migrated to native mode with a one-time notification.

#### Scenario: Legacy editor-mode setting exists
- **WHEN** the extension activates and detects legacy `terminalOpenMode=editor`
- **THEN** it updates the setting to native
- **AND** shows a migration info message once
