# Project Context

## Purpose

CLI Hub 是一个轻量级的 VS Code 扩展，旨在将多种 AI CLI 工具直接集成到编辑器中。主要目标：

- **一键启动终端**：在编辑器标题栏添加终端按钮，一键启动当前选择的 AI 工具
- **智能快捷键**：`Cmd+Shift+J` 一键多用 — 终端未打开时自动启动，已打开时发送文件路径
- **多工具切换**：支持 Codebuddy、Gemini CLI、Claude Code、Codex、GitHub Copilot CLI、Cursor CLI 等多种 AI 工具
- **无缝体验**：自动复用终端、智能检测工具安装状态、处理 Python 虚拟环境兼容性

## Tech Stack

- **语言**: TypeScript (strict mode)
- **运行时**: Node.js (ES2020)
- **目标平台**: VS Code Extension (`vscode ^1.99.0`)
- **构建工具**: TypeScript Compiler (`tsc`)
- **包管理**: npm
- **打包工具**: vsce (@vscode/vsce)
- **测试框架**: Mocha + @vscode/test-electron

## Project Conventions

### Code Style

- **缩进**: 2 空格
- **分号**: 保留分号
- **命名规范**:
  - 变量/函数: camelCase（如 `isCodebuddyTerminal`）
  - 常量: UPPER_SNAKE_CASE（如 `BRACKETED_PASTE_START`）
  - 接口: PascalCase（如 `CliHubConfig`）
- **命名空间**: 所有命令 ID 和配置项使用 `clihub.` 前缀
- **错误处理**: 使用 try-catch 配合 log 语句记录关键操作

### Architecture Patterns

**模块组织**:
- `src/extension.ts` - 主入口，包含命令注册、终端管理、工具选择等核心逻辑
- `src/terminal-utils.ts` - 终端工具函数（检测、分组、选项解析）
- `src/tool-selection.ts` - AI 工具选择相关逻辑
- `src/argument-parser.ts` - 命令行参数解析

**核心设计模式**:
- **终端状态管理**: 通过环境变量 `CLIHUB_TERMINAL` 标识扩展创建的终端
- **配置系统**: 从 `clihub.*` 命名空间读取 VS Code 设置
- **Bracketed Paste**: 使用 `\x1b[200~...\x1b[201~` 格式确保 CLI 兼容性
- **工具检测**: 通过 `which`/`where` 检测 CLI 是否安装并缓存结果

### Testing Strategy

- **调试方式**: 在 VS Code 中按 `F5` 启动 Extension Development Host
- **自动化测试**: 使用 `@vscode/test-electron` 框架，测试文件位于 `src/test/`
- **手动验证**: 在 PR 描述中记录手动测试场景
- **运行测试**: 
  ```bash
  npm run test           # 运行所有测试
  npm run test:unit      # 运行单元测试
  npm run test:integration  # 运行集成测试
  ```

### Git Workflow

- **提交信息**: 简洁、动作导向的主题行（中英文均可），无尾随标点
- **提交粒度**: 相关编辑合并为单个提交，避免功能与格式混合
- **版本发布**: 更新 `package.json` 版本号 → `vsce package` 生成 `.vsix`
- **文档更新**: 新功能需同步更新 `README.md`、`README_EN.md`、`CHANGELOG.md`

## Domain Context

**AI CLI 工具生态**：

| Tool ID        | 工具名称          | 安装方式                                        |
|----------------|-------------------|-----------------------------------------------|
| `codebuddy`    | Codebuddy         | `npm install -g @tencent-ai/codebuddy-code`   |
| `gemini`       | Gemini CLI        | `npm install -g @google/gemini-cli`           |
| `claude`       | Claude Code       | `npm install -g @anthropic-ai/claude-code`    |
| `codex`        | Codex             | `npm install -g @openai/codex`                |
| `copilot`      | GitHub Copilot    | `npm install -g @github/copilot`              |
| `cursor-agent` | Cursor CLI        | `curl https://cursor.com/install -fsS \| bash` |

**YOLO 模式**：各工具支持跳过权限确认的危险模式，通过 `clihub.toolArguments` 配置。

## Important Constraints

- **VS Code 版本**: 需要 `^1.99.0` 或更高版本
- **终端位置**: 终端固定创建在 `vscode.ViewColumn.Beside`（编辑器侧边）
- **分组锁定**: 创建终端后自动锁定编辑器组，防止被其他文件替换
- **Python 兼容**: 检测到虚拟环境时临时禁用 `python.terminal.activateEnvironment`
- **无自动发布**: `.vsix` 文件需手动分发，不自动发布到 Marketplace

## External Dependencies

**NPM 开发依赖**:
- `@types/vscode: 1.99.0` - VS Code API 类型定义
- `@types/node: ^24.6.2` - Node.js 类型定义
- `typescript: ^5.9.3` - TypeScript 编译器
- `mocha: ^11.7.4` - 测试框架
- `@vscode/test-electron: ^2.5.2` - VS Code 扩展测试工具

**运行时依赖**: 无（纯 VS Code 扩展 API）

**外部服务**:
- 无外部 API 调用
- 依赖用户本地安装的 AI CLI 工具
