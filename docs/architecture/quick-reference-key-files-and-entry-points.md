# Quick Reference - Key Files and Entry Points

## Critical Files for Understanding the System

- **主入口**: `src/extension.ts` - 终端会话管理、命令注册、路由与工具切换
- **终端工具函数**: `src/terminal-utils.ts` - 终端创建选项解析与辅助判断
- **配置清单**: `package.json` - 扩展声明、命令、配置项
- **TypeScript 配置**: `tsconfig.json` - 编译选项
- **测试套件**:
  - `src/test/suite/terminal-utils.test.ts` - 单元测试（36个用例）
  - `src/test/suite/terminal-adoption.test.ts` - 集成测试（终端复用/新建/并发）
  - `src/test/suite/test-helpers.ts` - 测试辅助函数

## Key Entry Points by Use Case

| 使用场景 | 入口点 | 文件位置 |
|---------|--------|---------|
| 打开终端（复用优先） | `clihub.openTerminalEditor` 命令 | `src/extension.ts` |
| 强制新建终端会话 | `clihub.openNewTerminalSession` 命令 | `src/extension.ts` |
| 发送文件/目录路径 | `clihub.sendPathToTerminal` 命令 | `src/extension.ts` |
| 切换 AI 工具 | `clihub.switchAITool` 命令 | `src/extension.ts` |
| 发送路由决策 | `resolveTargetTerminalForSend()` | `src/extension.ts` |
| 会话内 CLI 切换 | `switchCliInTerminal()` | `src/extension.ts` |
