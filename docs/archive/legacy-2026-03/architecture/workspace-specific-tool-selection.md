# 架构设计文档：项目级 AI 工具配置

**文档版本**: 1.0  
**创建日期**: 2024-11-18  
**架构师**: Winston  
**状态**: 待评审

---

## 📋 概述

### 需求背景

当前扩展的 AI 工具选择采用全局配置方式，所有项目（workspace）共享同一个工具选择。这导致以下问题：

**问题场景**：
1. 用户在项目 A 选择了 `codebuddy`
2. 切换到项目 B，选择了 `codex`
3. 回到项目 A，发现工具变成了 `codex`（被覆盖）

**用户期望**：
- 每个项目独立记住自己的 AI 工具选择
- 切换项目时自动恢复该项目之前的配置
- 配置过程对用户透明，无需手动管理配置文件

---

## 🎯 设计目标

### 主要目标
1. **项目级配置隔离**: 不同项目的工具选择互不影响
2. **用户体验透明**: 无需创建 `.vscode` 文件，无需手动配置
3. **向后兼容**: 现有用户的全局配置自动迁移，无需手动操作
4. **优雅降级**: 新项目自动使用合理的默认值

### 非目标
- ❌ 不支持跨机器同步配置（符合 VS Code workspaceState 标准行为）
- ❌ 不需要团队级配置共享（如需要，用户可手动编辑 `.vscode/settings.json`）

---

## 🔍 当前实现分析

### 存储机制

**当前代码位置**: `src/extension.ts:428-435`

```typescript
// 当前使用 globalState（全局存储）
function getStoredOrConfiguredToolId(context: vscode.ExtensionContext): string {
  const stored = context.globalState.get<string>('lastSelectedTool'); // ❌ 全局状态
  if (stored) {
    return stored;
  }
  const config = getConfig();
  return config.terminalCommand;
}
```

**问题根源**：
- `globalState` 是跨所有工作区的全局键值存储
- 切换工具时更新 `lastSelectedTool`，影响所有项目

### 工具切换逻辑

**当前代码位置**: `src/extension.ts:437-460`

```typescript
async function selectAITool(context: vscode.ExtensionContext): Promise<string | undefined> {
  const currentTool = getStoredOrConfiguredToolId(context);
  
  // ... 显示选择器 ...
  
  if (selected) {
    await context.globalState.update('lastSelectedTool', selected.toolId); // ❌ 覆盖全局
    updateStatusBar(selected.toolId);
    return selected.toolId;
  }
}
```

---

## ✨ 解决方案设计

### 架构方案：WorkspaceState（方案 2）

#### 核心设计理念

使用 VS Code 提供的 **workspaceState** API 实现项目级存储：
- **workspaceState**: 每个工作区独立的键值存储，生命周期与工作区绑定
- **globalState**: 保留作为全局默认值，影响所有未配置的项目
- **configuration**: 扩展默认配置，最低优先级

#### 存储层级设计

```
优先级从高到低：

1️⃣ workspaceState (项目级配置)
   ↓ 未设置时降级
2️⃣ globalState (用户全局默认值)
   ↓ 未设置时降级
3️⃣ codebuddy.terminalCommand (扩展默认配置)
```

---

## 🛠️ 详细设计

### 1. 数据模型

#### 存储键值定义

| 存储位置 | 键名 | 类型 | 说明 | 示例值 |
|---------|------|------|------|--------|
| `workspaceState` | `selectedTool` | `string` | 当前工作区选择的工具 ID | `"codebuddy"` |
| `globalState` | `defaultTool` | `string` | 用户设置的全局默认工具 | `"claude"` |
| `configuration` | `terminalCommand` | `string` | 扩展默认配置 | `"codebuddy"` |

#### 数据流图

```
┌─────────────────────────────────────────────────────────┐
│                    读取工具 ID 流程                      │
└─────────────────────────────────────────────────────────┘
                           ▼
          ┌────────────────────────────────┐
          │ workspaceState.get('selectedTool') │
          └────────────────────────────────┘
                           │
                   有值？───┤───► 返回项目级配置 ✅
                           │ 无
                           ▼
          ┌────────────────────────────────┐
          │  globalState.get('defaultTool')  │
          └────────────────────────────────┘
                           │
                   有值？───┤───► 返回全局默认值 ✅
                           │ 无
                           ▼
          ┌────────────────────────────────┐
          │ config.get('terminalCommand')  │
          └────────────────────────────────┘
                           │
                           └───► 返回扩展默认值 ✅
```

---

### 2. 核心函数重构

#### 2.1 读取函数重构

**原函数**: `getStoredOrConfiguredToolId`  
**新函数**: `getToolIdForWorkspace`

```typescript
/**
 * 获取当前工作区的 AI 工具 ID
 * 优先级: workspaceState > globalState > config
 * 
 * @param context - 扩展上下文
 * @returns 工具 ID（如 'codebuddy', 'claude', 'codex'）
 */
function getToolIdForWorkspace(context: vscode.ExtensionContext): string {
  // 1. 优先读取当前工作区的选择（项目级配置）
  const workspaceChoice = context.workspaceState.get<string>('selectedTool');
  if (workspaceChoice) {
    // 验证工具是否仍在可用列表中
    if (AI_TOOLS.some(t => t.id === workspaceChoice)) {
      return workspaceChoice;
    }
    // 工具不可用，清除无效配置
    context.workspaceState.update('selectedTool', undefined);
    try {
      log.warn(`[Codebuddy] Workspace tool '${workspaceChoice}' is no longer available, cleared.`);
    } catch { /* ignore */ }
  }
  
  // 2. 降级到用户的全局默认值
  const globalDefault = context.globalState.get<string>('defaultTool');
  if (globalDefault && AI_TOOLS.some(t => t.id === globalDefault)) {
    return globalDefault;
  }
  
  // 3. 最终降级到扩展配置
  return getConfig().terminalCommand;
}
```

**修改说明**：
- ✅ 函数名更清晰：明确表达"获取工作区的工具 ID"
- ✅ 增加工具可用性验证：防止引用已删除的工具
- ✅ 自动清理无效配置：提升健壮性

---

#### 2.2 保存函数重构

**修改位置**: `selectAITool` 函数

```typescript
async function selectAITool(context: vscode.ExtensionContext): Promise<string | undefined> {
  const currentTool = getToolIdForWorkspace(context); // ✅ 改用新函数
  
  const items = AI_TOOLS.map(tool => ({
    label: tool.label,
    description: tool.description,
    detail: tool.id === currentTool ? '$(check) Currently selected' : undefined,
    toolId: tool.id,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an AI tool for this workspace',
    title: 'Switch AI Tool',
  });

  if (selected) {
    // ✅ 保存到 workspaceState（仅影响当前项目）
    await context.workspaceState.update('selectedTool', selected.toolId);
    updateStatusBar(selected.toolId);
    
    try { 
      log.info(`[Codebuddy] Tool set for this workspace: ${selected.toolId}`); 
    } catch { /* ignore */ }
    
    return selected.toolId;
  }

  return undefined;
}
```

**修改说明**：
- ✅ 从 `globalState.update` 改为 `workspaceState.update`
- ✅ 日志消息更新，明确表示"为此工作区设置"

---

#### 2.3 初始化逻辑更新

**修改位置**: `activate` 函数

```typescript
export function activate(context: vscode.ExtensionContext) {
  initLogger();
  try { log.info('[Codebuddy] Extension activated'); } catch { /* ignore */ }
  
  // 初始化时从缓存恢复安装状态
  const cachedInstallationStatus = context.globalState.get<boolean>('codebuddyInstalled');
  if (cachedInstallationStatus !== undefined) {
    codebuddyInstallationChecked = true;
    codebuddyInstalled = cachedInstallationStatus;
  }

  // ✅ 使用新的项目级读取函数
  currentToolId = getToolIdForWorkspace(context);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'codebuddy.switchAITool';
  updateStatusBar(currentToolId);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  
  // ... 其余代码保持不变
}
```

---

### 3. 用户体验增强

#### 3.1 状态栏视觉反馈

**目标**: 让用户清楚知道当前工具配置的来源

```typescript
/**
 * 更新状态栏显示
 * @param toolId - 工具 ID
 * @param context - 扩展上下文
 */
function updateStatusBar(toolId: string, context: vscode.ExtensionContext) {
  if (!statusBarItem) return;
  
  const label = getToolLabel(toolId);
  
  // 判断配置来源
  const isWorkspaceSpecific = context.workspaceState.get<string>('selectedTool') !== undefined;
  
  // 使用不同图标区分配置来源
  const icon = isWorkspaceSpecific ? '$(folder)' : '$(globe)';
  
  statusBarItem.text = `$(terminal) ${label} ${icon}`;
  statusBarItem.tooltip = isWorkspaceSpecific
    ? `Current AI Tool: ${label} (workspace-specific)`
    : `Current AI Tool: ${label} (global default)`;
}
```

**视觉效果**：
- 📁 图标 = 项目级配置
- 🌐 图标 = 全局默认值

---

#### 3.2 工具选择器增强

**目标**: 在选择器中显示当前配置来源

```typescript
async function selectAITool(context: vscode.ExtensionContext): Promise<string | undefined> {
  const currentTool = getToolIdForWorkspace(context);
  const isWorkspaceChoice = context.workspaceState.get<string>('selectedTool') !== undefined;
  
  const items = AI_TOOLS.map(tool => {
    let detail: string | undefined;
    
    if (tool.id === currentTool) {
      const source = isWorkspaceChoice ? 'this workspace' : 'global default';
      detail = `$(check) Currently selected (${source})`;
    }
    
    return {
      label: tool.label,
      description: tool.description,
      detail,
      toolId: tool.id,
    };
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an AI tool for this workspace',
    title: 'Switch AI Tool',
  });
  
  // ...
}
```

**效果示例**：
```
┌─────────────────────────────────────────────────────┐
│  Switch AI Tool                                     │
├─────────────────────────────────────────────────────┤
│  ✓ Codebuddy                                        │
│    Tencent AI Codebuddy                             │
│    Currently selected (this workspace)              │
├─────────────────────────────────────────────────────┤
│  Gemini CLI                                         │
│    Google Gemini CLI                                │
├─────────────────────────────────────────────────────┤
│  Claude Code                                        │
│    Anthropic Claude Code                            │
└─────────────────────────────────────────────────────┘
```

---

### 4. 可选增强：全局默认值设置

为高级用户提供设置全局默认工具的能力。

#### 4.1 新增命令

```typescript
/**
 * 设置全局默认工具命令
 * 影响所有未设置项目级配置的工作区
 */
const setGlobalDefaultToolDisposable = vscode.commands.registerCommand(
  'codebuddy.setGlobalDefaultTool',
  async () => {
    const currentDefault = context.globalState.get<string>('defaultTool');
    
    const items = AI_TOOLS.map(tool => ({
      label: tool.label,
      description: tool.description,
      detail: tool.id === currentDefault ? '$(star) Current default' : undefined,
      toolId: tool.id,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select default AI tool for all workspaces',
      title: 'Set Global Default Tool',
    });

    if (selected) {
      await context.globalState.update('defaultTool', selected.toolId);
      vscode.window.showInformationMessage(
        `${selected.label} is now the default tool for new workspaces.`
      );
      
      try {
        log.info(`[Codebuddy] Global default tool set to: ${selected.toolId}`);
      } catch { /* ignore */ }
    }
  }
);

context.subscriptions.push(setGlobalDefaultToolDisposable);
```

#### 4.2 命令注册（package.json）

```json
{
  "contributes": {
    "commands": [
      {
        "command": "codebuddy.setGlobalDefaultTool",
        "title": "Set Global Default AI Tool",
        "category": "Codebuddy"
      }
    ]
  }
}
```

---

## 🧪 测试场景

### 功能测试用例

| 用例 ID | 场景描述 | 操作步骤 | 预期结果 |
|---------|---------|---------|---------|
| **TC-01** | 基本项目隔离 | 1. 打开项目 A，选择 `codebuddy`<br>2. 打开项目 B，选择 `codex`<br>3. 切回项目 A | 项目 A 自动恢复为 `codebuddy` |
| **TC-02** | 新项目降级到全局默认 | 1. 设置全局默认为 `claude`<br>2. 打开新项目 C（未配置） | 项目 C 使用 `claude` |
| **TC-03** | 无全局默认时降级到扩展配置 | 1. 未设置全局默认<br>2. 打开新项目 D | 项目 D 使用 `codebuddy`（扩展默认） |
| **TC-04** | 工具不可用时自动清理 | 1. 项目 A 选择 `gemini`<br>2. 从 AI_TOOLS 列表中移除 `gemini`<br>3. 重新打开项目 A | 自动降级到全局默认或扩展默认，无报错 |
| **TC-05** | 删除工作区后配置丢失 | 1. 项目 A 选择 `codex`<br>2. 删除项目 A 的工作区<br>3. 重新打开项目 A | 配置丢失，使用全局默认或扩展默认 |
| **TC-06** | 多根工作区 | 1. 打开多根工作区（A+B）<br>2. 选择工具 `claude` | 工具选择应用于整个多根工作区（不区分子文件夹） |
| **TC-07** | 状态栏图标显示 | 1. 项目 A 选择 `codebuddy`（项目级）<br>2. 项目 B 未设置（使用全局默认） | 项目 A 显示 📁，项目 B 显示 🌐 |
| **TC-08** | 向后兼容：迁移旧配置 | 1. 旧版本用户 `globalState.lastSelectedTool = 'claude'`<br>2. 升级到新版本 | `claude` 自动作为全局默认值，所有项目继续使用 |

### 边界条件测试

| 条件 | 处理方式 | 验证方法 |
|------|---------|---------|
| 工作区未打开（无 workspaceFolder） | 直接降级到 globalState 或 config | 打开单文件，选择工具，应使用全局配置 |
| workspaceState 中的工具 ID 无效 | 自动清除并降级 | 手动修改 workspaceState 为不存在的工具，验证自动降级 |
| 同时切换多个工作区窗口 | 每个窗口独立读取各自的 workspaceState | 打开 3 个窗口（项目 A/B/C），验证配置互不干扰 |

---

## 📊 数据流对比

### 修改前（全局配置）

```
┌────────────────────────────────────────────────────┐
│              用户操作流程（当前）                    │
└────────────────────────────────────────────────────┘

1. 用户在项目 A 选择 codex
         ▼
   globalState.update('lastSelectedTool', 'codex')
         ▼
   ┌─────────────────────────────────────┐
   │   globalState (全局共享)             │
   │   lastSelectedTool = 'codex'        │
   └─────────────────────────────────────┘
         ▼
   所有项目（A、B、C）都受影响
   
2. 切换到项目 B
         ▼
   globalState.get('lastSelectedTool')
         ▼
   返回 'codex' ❌（被项目 A 的选择覆盖）
```

### 修改后（项目级配置）

```
┌────────────────────────────────────────────────────┐
│              用户操作流程（新设计）                  │
└────────────────────────────────────────────────────┘

1. 用户在项目 A 选择 codebuddy
         ▼
   workspaceState[A].update('selectedTool', 'codebuddy')
         ▼
   ┌─────────────────────────────────────┐
   │   项目 A 的 workspaceState           │
   │   selectedTool = 'codebuddy'        │
   └─────────────────────────────────────┘

2. 用户在项目 B 选择 codex
         ▼
   workspaceState[B].update('selectedTool', 'codex')
         ▼
   ┌─────────────────────────────────────┐
   │   项目 B 的 workspaceState           │
   │   selectedTool = 'codex'            │
   └─────────────────────────────────────┘

3. 切换回项目 A
         ▼
   workspaceState[A].get('selectedTool')
         ▼
   返回 'codebuddy' ✅（独立存储，未被覆盖）

4. 打开新项目 C（未配置）
         ▼
   workspaceState[C].get('selectedTool') → undefined
         ▼
   globalState.get('defaultTool') → 'claude'（假设用户设置了全局默认）
         ▼
   返回 'claude' ✅（优雅降级）
```

---

## ⚠️ 边界情况处理

### 1. 无工作区场景

**场景**: 用户打开单个文件（非工作区）

```typescript
function getToolIdForWorkspace(context: vscode.ExtensionContext): string {
  // 检查是否有打开的工作区
  if (!vscode.workspace.workspaceFolders) {
    // 无工作区时，直接使用全局默认或配置
    const globalDefault = context.globalState.get<string>('defaultTool');
    if (globalDefault && AI_TOOLS.some(t => t.id === globalDefault)) {
      return globalDefault;
    }
    return getConfig().terminalCommand;
  }
  
  // 正常读取 workspaceState
  const workspaceChoice = context.workspaceState.get<string>('selectedTool');
  // ...
}
```

---

### 2. 工具不可用时的降级

**场景**: 用户配置的工具被从 AI_TOOLS 列表中移除

```typescript
function getToolIdForWorkspace(context: vscode.ExtensionContext): string {
  const workspaceChoice = context.workspaceState.get<string>('selectedTool');
  
  if (workspaceChoice) {
    // 验证工具是否仍在可用列表中
    if (AI_TOOLS.some(t => t.id === workspaceChoice)) {
      return workspaceChoice;
    }
    
    // 工具不可用，清除无效配置并记录日志
    context.workspaceState.update('selectedTool', undefined);
    try {
      log.warn(`[Codebuddy] Workspace tool '${workspaceChoice}' is no longer available, cleared.`);
    } catch { /* ignore */ }
  }
  
  // 降级到全局默认...
}
```

---

### 3. 多根工作区（Multi-root Workspace）

**行为**: workspaceState 在多根工作区中是共享的（VS Code 标准行为）

```typescript
// 无需特殊处理，workspaceState 自动适配多根工作区
// 用户在多根工作区中选择工具，该选择应用于整个多根工作区
```

**用户体验**:
- 打开多根工作区（包含项目 A 和 B）
- 选择工具 `claude`
- 整个多根工作区使用 `claude`（不区分 A 和 B）

---

## 📦 影响范围评估

### 代码修改清单

| 文件 | 修改类型 | 预估行数 | 说明 |
|------|---------|---------|------|
| `src/extension.ts` | 修改 | ~50 行 | 核心逻辑修改 |
| `package.json` | 新增 | ~10 行 | 新增命令定义（可选） |

### 函数修改列表

| 原函数名 | 新函数名 | 修改类型 | 行号 |
|---------|---------|---------|------|
| `getStoredOrConfiguredToolId` | `getToolIdForWorkspace` | 重构 | 428-435 |
| `selectAITool` | `selectAITool` | 修改保存逻辑 | 437-460 |
| `updateStatusBar` | `updateStatusBar` | 新增参数 | 421-426 |
| `activate` | `activate` | 修改初始化调用 | 550-587 |
| - | `setGlobalDefaultTool` (新增) | 新增 | - |

### 依赖变更

- ✅ 无新增外部依赖
- ✅ 仅使用 VS Code 内置 API (`workspaceState`, `globalState`)

---

## 🔄 向后兼容性

### 迁移策略

**旧数据**:
```typescript
globalState.get('lastSelectedTool') // 旧版本存储位置
```

**新数据结构**:
```typescript
workspaceState.get('selectedTool')  // 项目级配置
globalState.get('defaultTool')      // 新的全局默认值
```

**自动迁移逻辑** (可选实现):

```typescript
export function activate(context: vscode.ExtensionContext) {
  initLogger();
  
  // 迁移旧的全局配置到新的 defaultTool 键
  const oldGlobalTool = context.globalState.get<string>('lastSelectedTool');
  const newGlobalDefault = context.globalState.get<string>('defaultTool');
  
  if (oldGlobalTool && !newGlobalDefault) {
    // 迁移：将旧的全局选择作为新的全局默认值
    context.globalState.update('defaultTool', oldGlobalTool);
    try {
      log.info(`[Codebuddy] Migrated global tool selection: ${oldGlobalTool}`);
    } catch { /* ignore */ }
  }
  
  // 清理旧数据（可选，避免混淆）
  if (oldGlobalTool) {
    context.globalState.update('lastSelectedTool', undefined);
  }
  
  // 正常初始化...
  currentToolId = getToolIdForWorkspace(context);
  // ...
}
```

### 兼容性保证

| 场景 | 兼容性 | 说明 |
|------|--------|------|
| 旧版本用户升级 | ✅ 完全兼容 | 旧的 `lastSelectedTool` 自动迁移为 `defaultTool` |
| 降级回旧版本 | ⚠️ 部分兼容 | 旧版本会忽略新的 `defaultTool`，但 `lastSelectedTool` 已被清理 |
| 扩展配置文件 | ✅ 完全兼容 | `codebuddy.terminalCommand` 仍作为最低优先级默认值 |

---

## 🚀 发布计划

### 版本号建议

**推荐**: `v1.1.0` (Minor 版本升级)

**理由**:
- 新增功能（项目级配置）
- 向后兼容（无破坏性变更）
- 符合语义化版本规范

### Changelog 草稿

```markdown
## [1.1.0] - 2024-11-XX

### Added
- 🎯 **项目级工具配置**: AI 工具选择现在以项目为单位独立保存
  - 切换项目时自动恢复该项目之前的工具选择
  - 配置透明存储在 VS Code 内部数据库，不会在项目目录中创建 `.vscode` 文件
  - 保留全局默认值机制，兼容旧版本行为
- 📁 状态栏图标增强：显示配置来源（项目级 vs 全局默认）
  - 📁 图标 = 项目级配置
  - 🌐 图标 = 全局默认值
- ⚙️ 新增命令：`codebuddy.setGlobalDefaultTool` - 设置所有项目的默认工具（可选功能）

### Changed
- 🔧 重构配置读取逻辑：优先级为 workspaceState > globalState > config
- ✨ 工具选择器现在显示当前配置来源

### Fixed
- 🐛 修复不同项目间工具配置互相覆盖的问题

### Migration
- ✅ 无需用户操作，扩展会自动将旧的全局配置迁移为全局默认值
- ℹ️ 项目级配置存储在 VS Code 内部，删除工作区时配置会一并清除
```

---

## 🎯 成功指标

### 功能指标

- ✅ **隔离性**: 项目 A 和 B 的工具选择互不影响
- ✅ **持久性**: 关闭并重新打开项目，配置正确恢复
- ✅ **降级性**: 新项目自动使用合理的默认值
- ✅ **健壮性**: 工具不可用时自动降级，无崩溃

### 用户体验指标

- ✅ **透明性**: 无需手动创建配置文件
- ✅ **可发现性**: 状态栏清楚显示当前配置来源
- ✅ **一致性**: 符合 VS Code 扩展的标准行为

---

## 📚 参考资料

### VS Code API 文档

- [WorkspaceState API](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.workspaceState)
- [GlobalState API](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalState)
- [Configuration API](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration)

### 相关设计模式

- **优先级降级模式** (Fallback Pattern): workspaceState → globalState → config
- **透明存储模式** (Transparent Storage): 对用户隐藏存储细节
- **自动迁移模式** (Auto Migration): 旧数据自动迁移到新结构

---

## 附录

### A. 完整代码示例

参见本文档各章节的代码片段。

### B. 术语表

| 术语 | 定义 |
|------|------|
| workspaceState | VS Code 提供的工作区级键值存储 API，生命周期与工作区绑定 |
| globalState | VS Code 提供的全局键值存储 API，跨所有工作区共享 |
| 项目级配置 | 仅影响当前工作区的配置 |
| 全局默认值 | 影响所有未设置项目级配置的工作区 |
| 优雅降级 | 当高优先级配置不可用时，自动使用低优先级配置 |

---

**文档状态**: ✅ 待评审  
**下一步行动**: 交由 PM 基于此文档起草 User Story
