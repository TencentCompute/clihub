## 1. Implementation
- [x] 1.1 在 `package.json` 新增 `clihub.terminalOpenMode`（`native|editor`）与 `clihub.moveNativeTerminalToRight` 配置，并设置默认值为 `native` + `true`
- [x] 1.2 在 `src/extension.ts` 按模式改造终端创建与展示逻辑：`native` 使用原生面板终端，`editor` 保持现有 Terminal Editor 行为
- [x] 1.3 在 `native` 模式且开关开启时，执行“终端面板移动到右侧”动作
- [x] 1.4 确认 `clihub.sendPathToTerminal` 在两种模式下都可复用终端并发送路径/选区
- [x] 1.5 更新 `README.md`、`README_EN.md`、`CHANGELOG.md` 的配置说明与默认行为描述

## 2. Validation
- [ ] 2.1 手动验证默认配置：首次打开命令在原生终端面板启动，并自动位于右侧
- [ ] 2.2 手动验证 `terminalOpenMode=editor`：行为与当前版本一致（终端进入编辑区并可复用）
- [ ] 2.3 手动验证 `moveNativeTerminalToRight=false`：原生终端不强制改变面板位置
- [ ] 2.4 运行 `npm run compile` 与现有测试（如可执行），确认无类型/回归问题（`npm run compile` 已通过；`npm run test`/`npm run test:unit` 在当前环境均以 VS Code Test Host `SIGABRT` 终止）
