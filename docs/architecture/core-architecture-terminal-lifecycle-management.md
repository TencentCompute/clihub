# Core Architecture - Terminal Lifecycle Management

## 终端生命周期状态机

当前实现采用“多会话 + 激活终端优先路由”模型，终端在扩展中经历以下状态：

```
[会话不存在]
   ↓ openTerminalEditor / openNewTerminalSession / sendPath兜底
[创建中] (isOpeningTerminal = true, createCliHubTerminal)
   ↓
[会话已注册] (sessionRegistry.set)
   ↓
[可路由] (active > recent > create)
   ↓
[激活中] (onDidChangeActiveTerminal 更新 lastActiveAt)
   ↓ switchAITool
[会话内切换CLI] (switchCliInTerminal)
   ↓ 用户关闭终端
[销毁中] (onDidCloseTerminal -> removeSession)
   ↓
[会话移除]
```

## 关键机制

### 1. 终端复用机制

**目标**：在不牺牲并行会话能力的前提下优先复用，避免终端风暴。

**实现**：`resolveTerminalForOpen(toolId, forceNew, workspacePath)`  
- `forceNew=false`：按“激活会话 -> 最近活跃会话 -> 新建”  
- `forceNew=true`：始终新建会话（`openNewTerminalSession`）

**状态载体**：`sessionRegistry: Map<vscode.Terminal, TerminalSessionMeta>`

### 2. 并发保护机制

**问题**：用户快速连续触发命令可能造成并发创建。

**解决方案**：`isOpeningTerminal` 标志位 (src/extension.ts:331)

```typescript
let isOpeningTerminal = false;

const disposable = vscode.commands.registerCommand('clihub.openTerminalEditor', async () => {
  if (isOpeningTerminal) {
    log.debug('[Codebuddy] openTerminalEditor: skip because already opening');
    return;  // 如果正在打开，直接返回
  }
  isOpeningTerminal = true;
  
  try {
    // ... 终端创建逻辑 ...
  } finally {
    isOpeningTerminal = false;  // 无论成功失败，都重置标志
  }
});
```

**集成测试验证**：`terminal-adoption.test.ts` 测试 4

### 3. 激活终端路由机制

**目标**：实现“当前哪个 CLI Hub 终端激活，就发给哪个终端”。

**实现**：
```typescript
function resolveTargetTerminalForSend(toolId: string): vscode.Terminal | undefined {
  refreshSessionRegistryFromWindow();
  const active = findActiveCliHubTerminal(toolId);
  if (active) return active;
  return getMostRecentlyActiveSession(toolId);
}
```

**事件驱动更新**：
- `onDidChangeActiveTerminal`：更新 `lastActiveAt`
- `onDidOpenTerminal`：识别并注册 CLI Hub 会话
- `onDidCloseTerminal`：移除会话，清理活跃引用

### 4. 工具切换机制（会话内同步）

**目标**：切换工具时不强制销毁重建终端，优先在激活会话内切换 CLI。

**实现**：`switchCliInTerminal(terminal, nextToolId)`  
- 先发送 `Ctrl+C` (`\u0003`) 中断当前 CLI  
- 再发送新工具启动命令（含 `toolArguments`）
- 更新会话元数据 `toolId`

```typescript
async function switchCliInTerminal(terminal: vscode.Terminal, nextToolId: string): Promise<boolean> {
  terminal.show(true);
  terminal.sendText('\u0003', false);
  await delay(120);
  terminal.sendText(getStartCommandForTool(nextToolId, true), true);
  registerSession(terminal, nextToolId);
  return true;
}
```

### 5. 模式约束与迁移

当前仅支持 **native terminal panel**，`editor` 模式已移除。

历史兼容：
- 激活时检测到旧配置 `clihub.terminalOpenMode=editor` 时自动写回 `native`
- 一次性提示迁移信息，避免静默行为变化

对应迁移逻辑：
```typescript
if (hasEditorSetting && !migrated) {
  await config.update('terminalOpenMode', 'native', ...);
  vscode.window.showInformationMessage('...已自动切换为 native...');
}
```
