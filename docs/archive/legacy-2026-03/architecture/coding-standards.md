# Coding Standards

## TypeScript Style Guide

### Code Formatting

- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings
- **Line Length**: No hard limit, but prefer readability

### Naming Conventions

- **Variables & Functions**: camelCase
  ```typescript
  let codebuddyTerminal: vscode.Terminal;
  function getConfig(): CodebuddyConfig { ... }
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```typescript
  const BRACKETED_PASTE_START = '\x1b[200~';
  const CODEBUDDY_TERMINAL_ENV_KEY = 'CODEBUDDY_TERMINAL';
  ```

- **Types & Interfaces**: PascalCase
  ```typescript
  interface CodebuddyConfig { ... }
  type CodebuddyTerminalOptions = vscode.TerminalOptions & { isTransient?: boolean };
  ```

- **Command IDs**: `codebuddy.*` namespace
  ```typescript
  'codebuddy.openTerminalEditor'
  'codebuddy.sendPathToTerminal'
  ```

### TypeScript Configuration

- **Strict Mode**: Enabled (`strict: true`)
- **Target**: ES2020
- **Module**: CommonJS
- **Source Maps**: Enabled for debugging

### Error Handling

Use try-catch with logging pattern:

```typescript
try {
  log.info('[Codebuddy] Operation description');
  // ... operation code
} catch {
  /* ignore - expected to fail silently */
}
```

**Guidelines**:
- Always log significant operations at `info` level
- Use `debug` for verbose diagnostic information
- Use `warn` for non-critical issues
- Use `error` for critical failures
- Silently catch errors that are expected or non-critical
- Prefix all log messages with `[Codebuddy]` for filtering

### Async/Await Best Practices

- Prefer `async/await` over raw Promises
- Always handle Promise rejections
- Use `void` for fire-and-forget async calls:
  ```typescript
  void (async () => { await cleanup(); })();
  ```

### VS Code Extension Patterns

#### Command Registration

```typescript
const disposable = vscode.commands.registerCommand('codebuddy.commandName', async () => {
  // Command implementation
});
context.subscriptions.push(disposable);
```

#### Configuration Access

```typescript
const config = vscode.workspace.getConfiguration('codebuddy');
const value = config.get<string>('settingName') || 'defaultValue';
```

#### State Management

- **Global State**: For persistent data across VS Code sessions
  ```typescript
  context.globalState.update('key', value);
  const stored = context.globalState.get<Type>('key');
  ```

- **Module State**: For runtime state within extension lifecycle
  ```typescript
  let codebuddyTerminal: vscode.Terminal | undefined;
  ```

### Documentation

- Use JSDoc comments for public functions
- Inline comments for complex logic
- README/CODEBUDDY.md for architectural decisions

### Testing

- Manual testing in Extension Development Host (F5)
- Test all commands via Command Palette
- Verify keybindings work as expected
- Test configuration changes apply correctly

### Pre-commit Checklist

1. Run `npm run compile` to catch TypeScript errors
2. Test in Extension Development Host
3. Verify no console errors in Developer Tools
4. Check logs in Output panel
5. Test all affected commands manually

### Common Pitfalls to Avoid

- ❌ Don't use `console.log` - use LogOutputChannel
- ❌ Don't hard-code file paths - use workspace-relative paths
- ❌ Don't forget to add disposables to `context.subscriptions`
- ❌ Don't use interactive flags in bash commands (`-i`)
- ❌ Don't create terminals without tracking lifecycle
