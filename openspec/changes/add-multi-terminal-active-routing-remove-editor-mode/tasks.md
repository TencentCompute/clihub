## 1. Implementation
- [x] 1.1 重构终端状态模型为多会话注册表，并跟踪激活终端
- [x] 1.2 新增 `clihub.openNewTerminalSession` 命令和默认快捷键
- [x] 1.3 改造 `sendPathToTerminal` 为激活会话优先路由（无会话时自动新建）
- [x] 1.4 改造 `switchAITool` 为“激活会话内切换 CLI”优先
- [x] 1.5 移除 editor 模式实现与相关配置项，补充历史配置迁移提示
- [x] 1.6 更新文档与变更日志
- [x] 1.7 更新/修正集成测试

## 2. Validation
- [x] 2.1 `npm run compile`
- [x] 2.2 `npm run test:unit`
