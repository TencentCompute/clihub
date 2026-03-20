# Section 1: Project Analysis

## 1.1 Existing Project Overview

**项目名称**: Codebuddy Terminal Editor VS Code Extension

**当前状态**:
- 版本: 0.0.6
- 用途: VS Code 扩展，提供对多个 AI 编码助手的集成终端访问
- 支持的 AI 工具: Codebuddy、Gemini CLI、Claude Code、Codex、GitHub Copilot CLI、Cursor CLI
- 架构: 单文件设计（550 行 extension.ts）和状态驱动的终端生命周期管理
- 技术栈: TypeScript 5.9.3（严格模式）、VS Code Extension API ^1.99.0
- 安装方式: 通过 .vsix 包或 VS Code 市场

**当前功能**:
- 通过命令面板或快捷键（Cmd/Ctrl+Shift+J）一键启动 AI 工具终端
- 自动检测工具安装状态并提供安装引导
- 终端状态管理，支持 bracketed paste 模式
- 配置选项包括终端命令、终端名称和粘贴模式行为

**用户群体**: 使用 VS Code 的开发者，希望快速访问 AI 编码助手

## 1.2 Documentation Analysis

**现有文档**:
- `docs/brownfield-architecture.md`: 当前系统状态的全面技术文档
- `README.md` / `README_EN.md`: 面向用户的功能和使用文档
- `CHANGELOG.md`: 版本历史和变更记录

**文档缺口**:
- 缺少高级工具参数的配置示例
- 自定义工具行为的指导有限
- 没有工具特定参数需求的文档

## 1.3 Enhancement Scope

**增强类型**: 功能添加（新能力）

**添加内容**: 
用户可配置的命令行参数，允许用户通过 VS Code 设置为每个 AI 工具传递特定参数（例如 `--allow-all-tools`、`--verbose`）。

**增强原因**:
- 不同的 AI 工具支持各种命令行参数来增强功能
- 用户目前无法在不修改扩展代码的情况下自定义工具行为
- 常见用例: Cursor agent 需要 `--allow-all-tools` 才能完整功能
- 提高灵活性和用户对 AI 工具行为的控制

**集成方式**:
- 在 `package.json` 中添加新的配置模式用于工具特定参数
- 修改 `openTerminalEditor` 命令中的终端创建逻辑以注入自定义参数
- 保持向后兼容性 - 没有自定义参数时工具正常工作

**成功标准**:
- 用户可以通过 VS Code 设置 UI 配置自定义参数
- 参数正确注入到终端命令中
- 未配置自定义参数时现有工具功能保持不变
- 为每个 AI 工具提供清晰的文档和示例

---
