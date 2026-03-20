# Change: 增加原生终端模式切换与右侧定位选项

## Why
当前 CLI Hub 默认使用 Terminal Editor（编辑区终端）并固定到右侧列。用户希望支持在 VS Code 原生终端面板中打开，并可选自动将终端面板移动到右侧，且默认即为该行为。

## What Changes
- 新增配置项 `clihub.terminalOpenMode`，用于切换终端打开模式：
  - `native`：使用 VS Code 原生终端面板。
  - `editor`：使用现有 Terminal Editor 行为。
- 新增配置项 `clihub.moveNativeTerminalToRight`（布尔值），控制在 `native` 模式下是否自动将终端面板定位到右侧。
- 默认值调整为：
  - `clihub.terminalOpenMode = native`
  - `clihub.moveNativeTerminalToRight = true`
- `clihub.openTerminalEditor` 与 `clihub.sendPathToTerminal` 继续可用，并在两种模式下保持一致的终端复用与发送能力。

## Impact
- Affected specs:
  - 新增 capability: `terminal-mode`
- Affected code (implementation stage):
  - `src/extension.ts`（终端创建/展示逻辑按模式分支）
  - `package.json`（新增配置项及默认值）
  - `README.md`、`README_EN.md`、`CHANGELOG.md`
  - `src/test/`（补充模式切换与默认行为回归验证）

## Assumptions
- “原生 terminal”指 VS Code 底部/侧边面板中的终端（非 Terminal Editor 标签）。
- “移动到右侧”指将 VS Code 面板位置设置为右侧，而非创建新的编辑器列。
