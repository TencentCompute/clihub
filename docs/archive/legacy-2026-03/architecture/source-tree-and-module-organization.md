# Source Tree and Module Organization

## Project Structure (Actual)

```
clihub/
├── src/
│   ├── extension.ts              # 核心扩展逻辑（550行）- 所有命令、事件处理
│   ├── terminal-utils.ts         # 终端工具函数（125行）- 状态判断、分组查找
│   └── test/
│       ├── runTest.ts            # 测试运行器入口
│       └── suite/
│           ├── index.ts          # Mocha 配置
│           ├── test-helpers.ts   # 测试辅助函数
│           ├── terminal-utils.test.ts       # 单元测试（36个）
│           └── terminal-adoption.test.ts    # 集成测试（5个）
├── out/                          # 编译输出目录（.gitignore）
├── node_modules/                 # npm 依赖（.gitignore）
├── docs/
│   └── TESTING.md                # 测试文档
├── .bmad-core/                   # BMAD 代理系统配置（.gitignore）
├── package.json                  # 扩展清单 + npm 配置
├── tsconfig.json                 # TypeScript 编译配置
├── .vscodeignore                 # 打包排除文件
├── CODEBUDDY.md                  # 开发者指南（英文）
├── README.md                     # 用户文档（中文）
├── README_EN.md                  # 用户文档（英文）
└── CHANGELOG.md                  # 版本变更记录
```

## Key Modules and Their Purpose

### 1. `src/extension.ts` - 核心扩展逻辑（550行）

**职责**：
- 扩展激活/停用生命周期管理
- 所有命令注册和处理
- 终端生命周期管理（创建、复用、销毁）
- 全局状态管理（当前工具、安装状态、终端引用）
- 事件监听（终端打开、关闭）

**关键全局变量**：
```typescript
let codebuddyTerminal: vscode.Terminal | undefined;      // 当前追踪的终端
let codebuddyInstallationChecked = false;                // 是否已检查安装
let codebuddyInstalled = false;                          // CLI 工具是否已安装
let isOpeningTerminal = false;                           // 防并发标志
let log: vscode.LogOutputChannel;                        // 日志通道
let statusBarItem: vscode.StatusBarItem | undefined;     // 状态栏项
let currentToolId: string = 'codebuddy';                 // 当前选择的工具 ID
let terminalGroupLocked = false;                         // 编辑器分组是否已锁定
let codebuddyTerminalGroup: vscode.TabGroup | undefined; // 终端所在的编辑器分组
```

**核心函数**：
- `activate()` (292行) - 扩展激活入口
- `openTerminalEditor` 命令 (331行) - 打开/显示终端
- `sendPathToTerminal` 命令 (518行) - 发送文件/目录路径
- `switchAITool` 命令 (311行) - 切换 AI 工具
- `resolveCodebuddyTerminal()` (251行) - 解析当前终端状态
- `checkCommandInstalled()` (269行) - 检测 CLI 工具安装状态
- `cleanStaleTerminalTabs()` (41行) - 清理陈旧的 shell 标签

**已知问题**：
1. **打开终端时偶尔在错误的 group 创建 tab** - `vscode.ViewColumn.Two` 有时不按预期工作

### 2. `src/terminal-utils.ts` - 终端工具函数（125行）

**职责**：
- 终端类型判断（是否在 Editor、是否为通用 shell）
- 终端所属分组查找
- 终端配置摘要（用于调试日志）

**导出函数**：
- `isTerminalInEditor(terminal)` - 判断终端是否在 Terminal Editor
- `findGroupForTerminal(terminal)` - 查找终端所在的 TabGroup
- `getEditorTerminals()` - 获取所有 Editor 中的终端
- `isGenericShellPath(shellPath)` - 判断是否为通用 shell（zsh/bash/node 等）
- `shellPathMatchesTool(shellPath, toolId)` - shellPath 是否匹配工具 ID
- `shellArgsIncludeTool(shellArgs, toolId)` - shellArgs 是否包含工具 ID
- `nodeWrapperMatchesTool(options, toolId)` - 是否为 node 包装器调用
- `summarizeTerminalOptions(options)` - 生成终端配置摘要字符串

**测试覆盖**：36个单元测试，100% 函数覆盖

### 3. `src/test/` - 测试套件

详见 `docs/TESTING.md`，关键点：
- **单元测试**: 36个用例，覆盖所有 `terminal-utils.ts` 导出函数
- **集成测试**: 5个用例，覆盖终端创建、复用、并发保护
- **测试策略**: 先集成测试锁定行为，再单元测试补齐工具函数
- **测试隔离**: `afterEach` 清理所有终端
