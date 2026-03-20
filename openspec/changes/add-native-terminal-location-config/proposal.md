# Change: 新增原生终端位置配置

## Why
当前 CLI Hub 已移除旧的右侧定位开关，但仍存在“仅在用户显式选择时将终端面板移到右侧”的真实需求。需要在 `native-only` 架构下恢复这项能力，同时避免重新引入旧的模式切换复杂度。

## What Changes
- 新增公开配置 `clihub.nativeTerminalLocation`，支持 `panel` 和 `right`
- 默认保持 `panel`，即不主动改变用户现有的 VS Code 面板布局
- 当配置为 `right` 时，在 CLI Hub 打开或复用原生终端时执行面板右移
- 不兼容、不迁移旧配置 `clihub.moveNativeTerminalToRight`

## Impact
- Affected specs: `terminal-session-routing`
- Affected code:
  - `src/extension.ts`
  - `package.json`
  - `src/test/suite/terminal-adoption.test.ts`
  - `docs/architecture/terminal-session-routing-native-mode.md`
  - `docs/architecture/data-models-and-apis.md`
