# Technical Debt and Known Issues

## 已知关键问题

### 1. 打开终端时偶尔在错误的 group 创建 tab ⚠️

**现象**：
- 执行 `openTerminalEditor` 时，终端 tab 有时出现在非预期的编辑器分组
- 预期：在 `vscode.ViewColumn.Two`（第二列）创建
- 实际：偶尔在 `ViewColumn.One` 或其他列创建

**根本原因**：
- `location: { viewColumn: vscode.ViewColumn.Two }` 配置不总是生效
- 可能与当前编辑器布局状态有关（如只有一列时，Two 无法创建）

**相关代码**：src/extension.ts:388-398

**影响**：用户体验不一致

**建议修复方案**：
- 创建终端后，检查其所在的 group 是否符合预期
- 如不符合，使用 `workbench.action.moveEditorToNextGroup` 或类似命令移动
- 或在创建前先确保编辑器布局有两列（如执行 `workbench.action.splitEditor`）

## 技术债务

### 1. 单文件架构限制

**现状**：
- `src/extension.ts` 包含 550 行代码，所有逻辑集中在一个文件
- 虽然目前可维护，但未来功能增加可能导致文件过大

**影响**：
- 代码定位稍慢
- 重构风险增加

**建议**：
- 未来可拆分为多个模块：
  - `terminal-manager.ts` - 终端生命周期管理
  - `tool-switcher.ts` - 工具切换逻辑
  - `commands.ts` - 命令注册
  - `config.ts` - 配置管理

### 2. 全局状态管理

**现状**：
- 使用模块级全局变量管理状态（`codebuddyTerminal`, `currentToolId` 等）
- 虽然简单有效，但可能导致状态不一致

**风险**：
- 多处修改同一全局变量，难以追踪状态变化
- 重置状态时可能遗漏某些变量

**建议**：
- 考虑引入简单的状态管理类：
  ```typescript
  class ExtensionState {
    terminal?: vscode.Terminal;
    currentToolId: string = 'codebuddy';
    isOpeningTerminal: boolean = false;
    // ...
    reset() { /* 统一重置所有状态 */ }
  }
  ```

### 3. 错误处理不一致

**现状**：
- 大量使用 `try { ... } catch { /* ignore */ }` 模式
- 错误被静默忽略，可能隐藏潜在问题

**示例**：
```typescript
try { log.info('[Codebuddy] Creating new terminal'); } catch { /* ignore */ }
```

**风险**：
- 调试困难，无法追踪错误根源

**建议**：
- 至少在 catch 块中记录错误：
  ```typescript
  try { log.info('[Codebuddy] Creating new terminal'); } 
  catch (e) { log.error(`Failed to log: ${e}`); }
  ```

### 4. 配置项废弃但未移除

**现状**：
- `codebuddy.terminalCommand` 和 `codebuddy.terminalName` 已被工具切换机制替代
- 但仍在 `package.json` 中声明，且代码中仍读取这些配置

**影响**：
- 用户可能困惑哪些配置项是有效的
- 代码维护负担

**建议**：
- 在下个主版本中移除这些配置项
- 或在文档中明确标注为 "Deprecated"
