# Integration Points and External Dependencies

## External Services

**无外部服务依赖**

本扩展不调用任何外部 HTTP API 或云服务，所有功能均在本地执行。

## VS Code API Dependencies

**关键使用的 VS Code API**：

| API | 用途 | 关键位置 |
|-----|------|---------|
| `vscode.window.createTerminal()` | 创建终端 | src/extension.ts:400 |
| `vscode.window.terminals` | 获取所有终端列表 | src/terminal-utils.ts:49-62 |
| `vscode.window.tabGroups` | 访问编辑器分组和标签 | src/terminal-utils.ts:21-31 |
| `vscode.commands.registerCommand()` | 注册扩展命令 | src/extension.ts:311-542 |
| `vscode.commands.executeCommand()` | 执行 VS Code 内置命令 | src/extension.ts:412 |
| `vscode.workspace.getConfiguration()` | 读取配置 | src/extension.ts:86 |
| `vscode.window.onDidOpenTerminal` | 监听终端打开事件 | src/extension.ts:524 |
| `vscode.window.onDidCloseTerminal` | 监听终端关闭事件 | src/extension.ts:530 |
| `vscode.window.createOutputChannel()` | 创建日志通道 | src/extension.ts:216 |
| `vscode.window.createStatusBarItem()` | 创建状态栏项 | src/extension.ts:305 |
| `context.globalState` | 持久化存储扩展状态 | src/extension.ts:284, 202 |

**关键 VS Code 命令调用**：

| 命令 | 用途 | 调用位置 |
|-----|------|---------|
| `workbench.action.terminal.moveToEditor` | 将终端移动到编辑器区域 | src/extension.ts:412 |
| `workbench.action.focusSecondEditorGroup` | 聚焦第二编辑器分组 | src/extension.ts:124 |
| `workbench.action.lockEditorGroup` | 锁定编辑器分组 | src/extension.ts:136 |
| `workbench.action.unlockEditorGroup` | 解锁编辑器分组 | src/extension.ts:129 |

## CLI Tool Dependencies

**运行时依赖的 CLI 工具**（用户需自行安装）：

| 工具 | 命令名 | npm 包名 | 安装命令 |
|-----|--------|----------|----------|
| Codebuddy | `codebuddy` | `@tencent-ai/codebuddy-code` | `npm install -g @tencent-ai/codebuddy-code` |
| Gemini CLI | `gemini` | `@google/gemini-cli` | `npm install -g @google/gemini-cli` |
| Claude Code | `claude` | `@anthropic-ai/claude-code` | `npm install -g @anthropic-ai/claude-code` |
| Codex | `codex` | `@openai/codex` | `npm install -g @openai/codex` |
| Copilot CLI | `copilot` | `@github/copilot` | `npm install -g @github/copilot` |
| Cursor CLI | `cursor-agent` | - | `curl https://cursor.com/install -fsS \| bash` |

**安装检测**：使用 `which` (Unix) 或 `where` (Windows) 命令检测 CLI 工具是否存在于 PATH
