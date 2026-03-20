## 1. Implementation
- [x] 1.1 在 Codebuddy 未检测到安装时的提示框中新增 Repair 入口（仅非 Windows）
- [x] 1.2 Repair 入口通过终端执行 `scripts/fix-codebuddy.sh`
- [x] 1.3 Windows 平台提示 Repair 不支持
- [x] 1.4 更新 `README.md`、`README_EN.md`、`CHANGELOG.md` 说明新增 Repair 入口与限制

## 2. Validation
- [ ] 2.1 手动验证：非 Windows 环境下缺失 Codebuddy 时可触发 Repair；Windows 提示不支持
- [ ] 2.2 确认安装提示与原有 Install 流程不冲突
