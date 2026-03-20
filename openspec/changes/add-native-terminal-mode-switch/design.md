## Context
现有实现以 Terminal Editor 为核心：终端创建时携带 `location: { viewColumn: ... }`，并依赖“锁定右侧编辑器组”避免终端页被替换。新增原生终端模式后，需要在不破坏当前 editor 模式能力的前提下，引入可切换行为并设定新的默认值。

## Goals / Non-Goals
- Goals:
  - 支持 `native` / `editor` 两种终端打开模式。
  - 在 `native` 模式下提供“自动移到右侧面板”开关，默认开启。
  - 保持既有命令入口不变，避免命令层面的 breaking change。
- Non-Goals:
  - 不新增独立命令（例如“仅打开原生终端”）
  - 不改变 AI 工具选择、安装检测、参数注入等既有逻辑。

## Decisions
- Decision: 使用单一入口命令 `clihub.openTerminalEditor`，通过配置决定目标终端形态。
  - Rationale: 兼容现有快捷键与 UI 入口，降低迁移成本。
- Decision: `native` 模式下不传递 Terminal Editor 专用 `location`，按面板终端创建/复用。
  - Rationale: 确保行为与用户对“原生终端”的预期一致。
- Decision: 在 `native` 且 `moveNativeTerminalToRight=true` 时执行面板右侧定位命令。
  - Rationale: 让默认体验直接满足“原生 + 右侧”，且可按用户偏好关闭。
- Decision: 仅在 `editor` 模式执行编辑器组锁定/解锁相关逻辑。
  - Rationale: 原生面板模式不依赖 editor group 管理，避免无意义的布局干预。

## Risks / Trade-offs
- 风险: 将面板移动到右侧会影响用户全局布局偏好。
  - Mitigation: 提供 `clihub.moveNativeTerminalToRight` 开关并允许关闭。
- 风险: 模式切换后旧终端跟踪状态可能产生不一致。
  - Mitigation: 在切换工具或首次打开时统一走终端解析与复用逻辑，并补充回归测试。

## Migration Plan
1. 新增配置项并设置默认值。
2. 在终端创建路径按模式分支。
3. 原生模式增加“右侧面板定位”动作。
4. 更新文档与变更说明，并验证默认行为。

## Open Questions
- 无阻塞问题；若后续用户希望“右侧”解释为 Secondary Side Bar，可在后续变更中扩展。
