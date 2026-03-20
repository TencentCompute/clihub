## ADDED Requirements
### Requirement: Codebuddy repair entry on missing install
The system SHALL offer a Repair action when Codebuddy is not detected as installed.

#### Scenario: Missing Codebuddy on non-Windows
- **WHEN** the active tool is Codebuddy and installation check fails on macOS/Linux
- **THEN** the user is offered a Repair action that runs the fix script

#### Scenario: Missing Codebuddy on Windows
- **WHEN** the active tool is Codebuddy and installation check fails on Windows
- **THEN** the user is informed that Repair is not supported on Windows
