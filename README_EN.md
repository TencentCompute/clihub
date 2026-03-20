# CLI Hub: AI Tools Terminal

English | [中文](./README.md)

A lightweight VS Code extension that brings multiple AI CLI tools into your editor with multi-terminal sessions and active-session routing.

Download: use the GitHub Actions build artifacts or the `.vsix` asset attached to GitHub Releases.

## Features

### 1. Quick Terminal Access
- Adds an editor title bar button (terminal icon) to launch the active AI tool
- Opens the terminal in the native VS Code terminal panel by default
- `Open Terminal` reuses the active/recent CLI Hub session when possible
- `Open New Terminal Session` creates a fresh parallel CLI session
- Offers a Repair entry for Codebuddy when it is not detected (macOS/Linux only)
- Send routing: active CLI Hub terminal first, then most recently active session, else auto-create one.

### 2. Send File Paths to the AI Tool Terminal
Use the keyboard shortcut `Cmd+Shift+J` (Mac) or `Ctrl+Shift+J` (Windows/Linux) to send file information to the AI tool terminal:

**In Editor (requires editor focus):**
- **Without selection**: Sends the current file's relative path
- **With selection**: Sends the file path along with the selected line range
- Example: `@src/extension.ts L10-20 `

**Alternative Methods:**
- Right-click a file or directory in Explorer and select "Send File Path to AI Tool Terminal" (directories include trailing `/`)
- Use Command Palette: `CLI Hub: Send File Path to AI Tool Terminal`
- New session shortcut: `Cmd+Ctrl+Shift+J` (Mac) / `Ctrl+Alt+Shift+J` (Windows/Linux)

### 3. Switch Between AI Tools
- Built-in profiles for Codebuddy, Gemini CLI, Claude Code, Codex, GitHub Copilot CLI, and Cursor CLI
- Change the active tool from the status bar or with the `CLI Hub: Switch AI Tool` command. If a CLI Hub terminal is active, switching happens in that same terminal.

## Usage

1. Press `Cmd+Shift+J` / `Ctrl+Shift+J` to open the terminal and start the active CLI.
2. Once the prompt appears, press the shortcut again to send the current file/selection context.
3. You can also click the editor title bar terminal icon to open the terminal manually.

## Configuration

> `clihub.terminalOpenMode` and `clihub.moveNativeTerminalToRight` are removed.  
> Reason: editor mode introduced extra editor-group locking/layout timing complexity and made multi-session active-routing less stable. The extension is now native-only to reduce regressions.

### `clihub.toolArguments`
Configure `clihub.toolArguments` in VS Code `settings.json` (or via the Settings UI) to append extra CLI flags when the extension launches each supported tool. Every value defaults to an empty string.

> 💡 **Copy and paste ready**: Each snippet below has been verified with the extension and can be dropped into your settings as-is.

#### Conservative sample (default behavior)
```json
{
  "clihub.toolArguments": {
    "codebuddy": "",
    "gemini": "",
    "claude": "",
    "codex": "",
    "copilot": "",
    "cursor-agent": ""
  }
}
```

#### YOLO profile (enable all automation flags)
```json
{
  "clihub.toolArguments": {
    "codebuddy": "--dangerously-skip-permissions",
    "gemini": "--yolo",
    "claude": "--dangerously-skip-permissions",
    "codex": "--full-auto",
    "copilot": "--allow-all-tools",
    "cursor-agent": "--force"
  }
}
```

### `clihub.toolEnvironments`
Configure `clihub.toolEnvironments` in VS Code `settings.json` to inject per-tool environment variables (`KEY=VALUE`).

This is useful when a CLI must be launched with both env vars and flags, such as:
- Target command: `IS_SANDBOX=1 claude --dangerously-skip-permissions`
- Config approach: set env vars for `claude`, then set flags in `toolArguments`

```json
{
  "clihub.toolEnvironments": {
    "claude": {
      "IS_SANDBOX": "1"
    }
  },
  "clihub.toolArguments": {
    "claude": "--dangerously-skip-permissions"
  }
}
```

#### Mixed profile (enable only selected tools)
```json
{
  "clihub.toolArguments": {
    "codebuddy": "--dangerously-skip-permissions",
    "gemini": "--yolo",
    "claude": "",
    "codex": "",
    "copilot": "",
    "cursor-agent": "--force"
  }
}
```

### YOLO parameter reference

| Tool | Flag | Description | Risk |
|------|------|-------------|------|
| **Copilot** | `--allow-all-tools` | Grants access to every tool and system feature | 🔴 High |
| **Claude** | `--dangerously-skip-permissions` | Skips permission prompts and executes automatically | 🔴 High |
| **Codebuddy** | `--dangerously-skip-permissions` | Skips permission prompts and executes automatically | 🔴 High |
| **Codex** | `--full-auto` | Full automation without human confirmation | 🔴 High |
| **Gemini** | `--yolo` | Auto-confirms all operations | 🔴 High |
| **Cursor Agent** | `--force` / `-f` | Forces command execution unless explicitly denied | 🔴 High |

> <span style="color:#c62828;font-weight:600">⚠️ Safety warning:</span> YOLO parameters bypass safety checks and let the CLI execute commands without human review. Understand the trade-offs before enabling them:
> - **High-risk operations**: Commands can alter files, settings, or system resources without prompts.
> - **Data exposure**: Sensitive content may be read or modified automatically.
> - **Code integrity**: Automated edits can land without peer review.
>
> **Recommended for**: Local experiments, isolated sandboxes, engineers who fully understand the CLI behavior.  
> **Avoid in**: Production environments, shared repositories, projects with sensitive data.

### Troubleshooting
1. **Invalid JSON**: Ensure double quotes are used and commas are in place.
2. **Unknown parameter**: Run `<tool> --help` to confirm the flag is supported.
3. **Flag ignored**: Close the existing terminal and relaunch it via the extension.
4. **Multiple flags**: Separate them with spaces, e.g. `"--flag1 --flag2 value"`.
5. **Whitespace inside values**: Wrap them in quotes such as `"--arg \"value with spaces\""`; VS Code preserves the quoting.

### Usage tips
- **First run**: Start with the conservative profile to validate the CLI.
- **Local development**: Enable YOLO flags only for tools that truly benefit from automation and keep version control handy.
- **Production/shared setups**: Leave the values empty to avoid escalating privileges unintentionally.

## Development

### Setup
```bash
npm install
npm run compile
```

### Testing
To test the extension locally:
1. Open this project in VS Code
2. Press `F5` to start debugging (or use the Run and Debug view)
3. A new Extension Development Host window will open
4. Test the features in the new window

### Building
```bash
npm run compile
```

The compiled extension will be in the `./out` directory.

### Packaging
To package the extension as a `.vsix` file:
```bash
./release.sh 1.4.2 --channel public
```

This creates a `.vsix` file that can be installed in VS Code via:
- Extensions view → ⋯ menu → Install from VSIX...
- Or: `code --install-extension cli-hub-1.4.2-public.vsix`

## Logging & Troubleshooting
- Output channel: select "CLI Hub Terminal" in the Output panel.
- Useful messages:
  - `Created new terminal session` – a new session is created
  - `Switched active terminal to tool=...` – tool switched in the active session
  - `sendPath: no terminal for current tool, creating new session` – send fallback auto-created a session
  - `Terminal closed: name=... exitCode=...` – terminal close status

If routing does not match expectations, please share these lines in an issue.
