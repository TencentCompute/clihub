# Source Tree Structure

```
clihub/
├── .bmad-core/                    # BMAD framework configuration
│   ├── agents/                    # Agent personas (architect, dev, qa, etc.)
│   ├── tasks/                     # Reusable task workflows
│   ├── templates/                 # Document templates
│   ├── checklists/                # Workflow checklists
│   ├── data/                      # Reference data
│   └── core-config.yaml           # Project configuration
│
├── .vscode/                       # VS Code workspace settings
│   └── launch.json                # Debug configuration for F5
│
├── docs/                          # Project documentation
│   ├── architecture/              # Architecture documentation
│   │   ├── coding-standards.md    # This file - coding conventions
│   │   ├── tech-stack.md          # Technology choices and rationale
│   │   └── source-tree.md         # Directory structure (this file)
│   ├── prd/                       # Product requirements (sharded)
│   ├── stories/                   # User stories
│   └── qa/                        # QA documentation
│
├── src/                           # TypeScript source code
│   ├── argument-parser.ts         # CLI argument parsing helpers (Story 1.4)
│   ├── extension.ts               # **Main extension entry point**
│   │                              # - Command registration
│   │                              # - Terminal lifecycle management
│   │                              # - Installation detection
│   │                              # - AI tool switching
│   │                              # - Logging and state management
│   │
│   ├── terminal-utils.ts          # Terminal utility functions
│   │                              # - isTerminalInEditor()
│   │                              # - findGroupForTerminal()
│   │
│   └── test/                      # Test suites
│       ├── runTest.ts             # Test runner entry point
│       └── suite/
│           ├── index.ts           # Test suite configuration
│           ├── argument-parser.test.ts    # Argument parsing unit tests
│           ├── terminal-adoption.test.ts   # Terminal state tests
│           ├── terminal-utils.test.ts      # Utility function tests
│           └── test-helpers.ts    # Test utilities
│
├── out/                           # Compiled JavaScript output (generated)
│   ├── extension.js               # Compiled main extension
│   ├── terminal-utils.js
│   └── test/
│
├── package.json                   # Extension manifest
│   ├── Extension metadata
│   ├── Command contributions
│   ├── Configuration schema
│   ├── Keybindings
│   ├── Menu integrations
│   └── Build scripts
│
├── tsconfig.json                  # TypeScript compiler configuration
├── CODEBUDDY.md                   # Developer onboarding guide
└── README.md                      # User-facing documentation

```

## Key Files

### Extension Entry Point
- **src/extension.ts** (~945 lines after Story 1.4)
  - Single-file extension containing all core logic
  - Exports `activate()` and `deactivate()` lifecycle functions
  - Manages global state and terminal references

### Utility Modules
- **src/argument-parser.ts**
  - Shared command-line argument parsing
  - Emits warnings for unmatched quotes via provided logger

- **src/terminal-utils.ts**
  - Helper functions for terminal detection
  - Editor group resolution

### Configuration
- **package.json**
  - Extension manifest (VS Code metadata)
  - Command contributions
  - Configuration schema
  - Keybindings (`Cmd+Shift+J` / `Ctrl+Shift+J`)
  - UI integration points (editor title, context menus)

### TypeScript Configuration
- **tsconfig.json**
  - Compiler options: ES2020 target, CommonJS modules
  - Source maps enabled
  - Strict mode enabled

## Module Organization

### Core Modules (src/extension.ts)

#### State Management
```typescript
// Terminal tracking
let codebuddyTerminal: vscode.Terminal | undefined;
let codebuddyTerminalGroup: vscode.TabGroup | undefined;

// Installation state
let codebuddyInstallationChecked = false;
let codebuddyInstalled = false;

// UI state
let statusBarItem: vscode.StatusBarItem | undefined;
let currentToolId: string = 'codebuddy';
let terminalGroupLocked = false;
```

#### Core Functions
- `activate(context)` - Extension initialization
- `deactivate()` - Cleanup on extension shutdown
- `getConfig()` - Read user configuration
- `checkCommandInstalled()` - CLI detection
- `resolveCodebuddyTerminal()` - Terminal state resolution
- `selectAITool()` - Tool switcher UI
- `disposeTrackedTerminal()` - Terminal cleanup
- `lockSecondEditorGroup()` / `unlockSecondEditorGroup()` - Group locking
- `closeTrackedGroupIfEmpty()` - Group cleanup

#### Command Handlers
- `codebuddy.openTerminalEditor` - Create/show terminal
- `codebuddy.sendPathToTerminal` - Send file paths (Cmd+Shift+J)
- `codebuddy.switchAITool` - Switch between AI tools
- `codebuddy.refreshDetection` - Re-check CLI installation
- `codebuddy.cleanStaleTerminalTabs` - Remove stale shells
- `codebuddy.showLogs` - Open log panel

#### Event Handlers
- `onDidOpenTerminal` - Track new terminals
- `onDidCloseTerminal` - Clean up closed terminals

### Utility Modules (src/terminal-utils.ts)

```typescript
export function isTerminalInEditor(terminal: vscode.Terminal): boolean
export function findGroupForTerminal(terminal: vscode.Terminal): vscode.TabGroup | undefined
```

## Build Output

### Compilation Process
```
src/extension.ts  →  tsc  →  out/extension.js
src/argument-parser.ts → tsc → out/argument-parser.js
src/terminal-utils.ts → tsc → out/terminal-utils.js
```

### Generated Files (out/)
- JavaScript files (ES2020 syntax)
- Source maps (.js.map)
- Type declarations (.d.ts) - if enabled

## Test Structure

### Test Organization
```
src/test/
├── runTest.ts               # VS Code test launcher
└── suite/
    ├── index.ts             # Mocha configuration
    ├── argument-parser.test.ts      # Argument parser unit tests
    ├── terminal-adoption.test.ts    # Integration tests
    ├── terminal-utils.test.ts       # Unit tests
    └── test-helpers.ts      # Test utilities
```

### Running Tests
```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
```

## Documentation Structure

### Developer Documentation
- **CODEBUDDY.md** - Onboarding guide for developers
- **docs/architecture/** - Technical architecture
  - coding-standards.md - Code style and conventions
  - tech-stack.md - Technology decisions
  - source-tree.md - This file

### BMAD Framework
- **.bmad-core/** - Development workflow automation
  - Agents: Personas for different roles (architect, dev, qa)
  - Tasks: Executable workflows
  - Templates: Document scaffolding

## Important Paths

### Development
- **Source**: `src/extension.ts` (main entry point)
- **Build Output**: `out/extension.js`
- **Logs**: VS Code Output panel → "Codebuddy Terminal"

### Configuration
- **Extension Settings**: `.vscode/settings.json` (workspace) or User Settings
- **Launch Config**: `.vscode/launch.json` (F5 debugging)

### Distribution
- **Package**: `codebuddy-terminal-editor-0.0.x.vsix`
- **Installation**: `code --install-extension <vsix>`

## Dependencies

### Production
- **None** - Extension only depends on VS Code API

### Development
- `@types/vscode` - VS Code API type definitions
- `@types/node` - Node.js type definitions
- `typescript` - TypeScript compiler
- `@vscode/vsce` - Extension packaging tool (global)

### Testing
- `@vscode/test-electron` - VS Code test runner
- `mocha` - Test framework
- `@types/mocha` - Mocha type definitions
