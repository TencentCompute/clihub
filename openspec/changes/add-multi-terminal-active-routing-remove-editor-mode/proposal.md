# Change: 多 Terminal 会话与激活终端路由，移除 editor 模式

## Why
当前实现使用单终端跟踪，无法满足多会话并行与“当前激活终端优先发送”的体验。并且 `editor` 模式维护成本高，已成为新能力改造阻力。

## What Changes
- 引入 CLI Hub 终端会话注册表，支持多个会话并行存在。
- 新增命令 `clihub.openNewTerminalSession`，用于显式创建新会话。
- `clihub.sendPathToTerminal` 路由升级为“激活会话优先，其次最近活跃会话”。
- `clihub.switchAITool` 在激活 CLI Hub 终端时，直接在该终端内同步切换到新工具。
- 移除 `editor` 模式相关逻辑，仅保留原生终端面板。
- 移除配置项 `clihub.terminalOpenMode` / `clihub.moveNativeTerminalToRight`，并对历史 `editor` 配置自动迁移到 native。

## Impact
- Affected specs: `terminal-session-routing`
- Affected code:
  - `src/extension.ts`
  - `package.json`
  - `src/test/suite/terminal-adoption.test.ts`
  - `README.md`, `README_EN.md`, `CHANGELOG.md`
