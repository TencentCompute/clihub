# Appendix - Useful Commands and Scripts

## Frequently Used Commands

```bash
# 开发
npm install           # 安装依赖
npm run compile       # 编译 TypeScript
npm run watch         # 监听模式编译

# 测试
npm test              # 运行所有测试
npm run test:unit     # 仅单元测试
npm run test:integration  # 仅集成测试

# 打包
vsce package          # 打包为 .vsix

# 安装
code --install-extension codebuddy-terminal-editor-0.0.8.vsix

# BMAD 相关（如使用 BMAD 代理系统）
npm run bmad:refresh  # 刷新 BMAD 配置
npm run bmad:list     # 列出可用代理
npm run bmad:validate # 验证 BMAD 配置
```

## Debugging and Troubleshooting

**查看日志**：
- 执行命令：`Codebuddy: Show Codebuddy Logs`
- 或：打开 Output 面板 → 选择 "Codebuddy Terminal"

**常见问题**：

| 问题 | 排查步骤 |
|-----|---------|
| 终端未打开 | 1. 检查日志中是否有错误<br>2. 执行 `codebuddy.refreshDetection` 重新检测安装<br>3. 检查 CLI 工具是否在 PATH 中 |
| 快捷键不工作 | 1. 确保编辑器有焦点（快捷键仅在 `editorFocus` 时生效）<br>2. 检查是否有其他扩展占用 `Cmd+Shift+J`<br>3. 在键盘快捷方式设置中搜索 `codebuddy.sendPathToTerminal` |
| 终端残留/重复 | 1. 手动执行 `codebuddy.cleanStaleTerminalTabs`<br>2. 重启 VS Code<br>3. 检查日志中终端创建/销毁事件 |
| 切换工具失败 | 1. 检查新工具是否已安装（`which <tool>` 或 `where <tool>`）<br>2. 执行 `codebuddy.refreshDetection`<br>3. 查看日志中的错误信息 |

**调试技巧**：
- 启用日志自动显示：设置 `codebuddy.autoShowLogsOnStartup` 为 `true`
- 使用 Extension Development Host 调试：在源码中设置断点，按 `F5` 启动调试
- 检查终端状态：在调试控制台执行 `vscode.window.terminals`
