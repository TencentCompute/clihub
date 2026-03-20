## Context
扩展在检测到工具未安装时仅提供安装提示，而 Codebuddy 的常见问题是安装残留导致命令不可用。现有修复脚本位于 `scripts/fix-codebuddy.sh`，需要用户手动执行。

## Goals / Non-Goals
- Goals:
  - 在 Codebuddy 未检测到安装时提供 Repair 入口，降低修复成本。
  - 复用现有脚本，不内联逻辑。
- Non-Goals:
  - 不在 Windows 上支持修复脚本（仅提示不支持）。
  - 不新增常驻命令或自动修复逻辑。

## Decisions
- Decision: Repair 入口仅在 Codebuddy 未检测到安装时出现
  - 原因：保持变更最小、避免误用。
- Decision: 通过终端执行脚本
  - 原因：脚本包含交互确认步骤，终端交互更适配。

## Risks / Trade-offs
- Repair 仅对“未检测到安装”生效，无法覆盖已安装但启动失败的其他场景。
  - Mitigation：保留脚本位置，用户可自行运行。
