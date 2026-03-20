# Change: Codebuddy 无法启动时提供修复入口

## Why
Codebuddy 自动更新后偶发安装残留导致启动失败，当前扩展只提供安装提示，用户需手动运行修复脚本，操作成本高且容易遗忘。

## What Changes
- 当检测到 Codebuddy 未安装时，在提示框中新增“Repair”入口，用于执行 `scripts/fix-codebuddy.sh`。
- Repair 仅在非 Windows 平台提供（脚本依赖 bash/find）。Windows 用户提示不支持。
- 修复脚本继续作为独立文件随扩展发布，不内联到 TypeScript。

## Impact
- Affected specs:
  - 新增 capability: `tool-installation`
- Affected code (implementation stage):
  - `src/extension.ts`（安装检测提示交互）
  - `scripts/fix-codebuddy.sh`（保持不变，仅被调用）
  - `README.md`、`README_EN.md`、`CHANGELOG.md`
