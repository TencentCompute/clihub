# Technology Stack

## Core Technologies

### VS Code Extension API
- **Version**: 1.99.0+
- **Purpose**: Primary platform for extension development
- **Key APIs Used**:
  - `vscode.window` - Terminal, status bar, notifications
  - `vscode.commands` - Command registration and execution
  - `vscode.workspace` - Configuration and workspace management
  - `vscode.window.tabGroups` - Editor group management
  - `LogOutputChannel` - Structured logging

### TypeScript
- **Version**: 5.9.3
- **Configuration**: 
  - Target: ES2020
  - Module: CommonJS
  - Strict mode enabled
  - Source maps for debugging

### Node.js
- **Version**: Compatible with VS Code engine
- **Modules Used**:
  - `child_process` - CLI command detection
  - `path` - File path manipulation

## Development Tools

### Build Tools
- **TypeScript Compiler**: `tsc`
  - Compile: `npm run compile`
  - Watch mode: `npm run watch`
  - Output: `out/` directory

### Packaging
- **@vscode/vsce**: VS Code Extension Manager
  - Package: `vsce package`
  - Creates: `.vsix` distribution files

### Testing
- **Framework**: Mocha 11.7.4
- **VS Code Test Runner**: @vscode/test-electron 2.5.2
- **Approach**: Manual testing in Extension Development Host (F5)

## Runtime Dependencies

### VS Code Extensions API
- **Terminal API**: Terminal creation, lifecycle, and text sending
- **Commands API**: Command palette integration
- **Configuration API**: Settings management
- **Status Bar API**: Tool switcher UI
- **Tab Groups API**: Editor group manipulation and locking

### External CLI Tools (Optional)
Supported AI CLI tools that can be integrated:
- **Codebuddy** - `@tencent-ai/codebuddy-code`
- **Gemini CLI** - `@google/gemini-cli`
- **Claude Code** - `@anthropic-ai/claude-code`
- **Codex** - `@openai/codex`
- **GitHub Copilot** - `@github/copilot`
- **Cursor CLI** - `cursor-agent`

## Architecture Patterns

### Extension Lifecycle
```
activate() → Register Commands → Listen Events → deactivate()
```

### State Management
- **Global State**: Persistent across VS Code sessions (ExtensionContext.globalState)
- **Module State**: Runtime variables (codebuddyTerminal, currentToolId)
- **Configuration**: User/workspace settings (vscode.workspace.getConfiguration)

### Event-Driven Architecture
- `onDidOpenTerminal` - Track terminal creation
- `onDidCloseTerminal` - Clean up resources
- Configuration change listeners - React to settings updates

### Terminal Management Pattern
1. **Terminal Classification**: Identify terminals by environment variables
2. **Terminal Reuse**: Check for existing terminals before creating new ones
3. **Lifecycle Tracking**: Monitor terminal state and cleanup on disposal
4. **Group Locking**: Prevent accidental terminal replacement

## Platform Compatibility

### Supported Platforms
- **macOS**: Primary development platform (Darwin)
- **Windows**: Supported via platform-specific commands
- **Linux**: Supported

### Platform-Specific Handling
- Command detection: `which` (Unix) vs `where` (Windows)
- Path separators: Handled by Node.js `path` module
- Keybindings: `Cmd` (Mac) vs `Ctrl` (Windows/Linux)

## Integration Points

### CLI Command Detection
```typescript
// Platform-aware command detection
const command = process.platform === 'win32' 
  ? `where ${cmdToCheck}` 
  : `which ${cmdToCheck}`;
```

### Bracketed Paste Mode
- **Purpose**: Compatibility with Gemini CLI and similar tools
- **Format**: `\x1b[200~{text}\x1b[201~`
- **Usage**: Wraps file paths when sending to terminal

### Workspace Integration
- Workspace folder detection for relative paths
- CWD initialization to active workspace
- Multi-root workspace support

## Configuration Schema

### Extension Settings
```json
{
  "codebuddy.terminalCommand": {
    "type": "string",
    "default": "codebuddy"
  },
  "codebuddy.terminalName": {
    "type": "string",
    "default": "Codebuddy Code"
  },
  "codebuddy.autoShowLogsOnStartup": {
    "type": "boolean",
    "default": false
  },
  "codebuddy.autoCleanStaleTerminalTabs": {
    "type": "string",
    "enum": ["off", "prompt", "auto"],
    "default": "prompt"
  }
}
```

## Deployment

### Distribution
- **.vsix Package**: Created via `vsce package`
- **Installation**: `code --install-extension codebuddy-terminal-editor-0.0.x.vsix`
- **Repository**: Git repository for source control

### Version Management
- **Current**: 0.0.8
- **Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)
