# Enhancement Opportunities

基于已知问题和用户需求，以下是推荐的改进方向：

## 高优先级

1. **修复终端创建位置不稳定问题**
   - 实现方案：创建后验证位置，必要时移动到正确的 group
   - 影响文件：`src/extension.ts:388-415`

2. **自动清理陈旧终端**
   - 实现方案：在 `activate()` 或 `openTerminalEditor` 中自动触发 `cleanStaleTerminalTabs()`
   - 影响文件：`src/extension.ts:292, 331`

## 中优先级

3. **重构单文件架构**
   - 拆分为多个模块，提高可维护性
   - 影响文件：创建新文件 `terminal-manager.ts`, `tool-switcher.ts`, `commands.ts`

4. **改进错误处理**
   - 在 catch 块中记录错误详情
   - 影响文件：`src/extension.ts` 全文

5. **添加更多 AI 工具支持**
   - 扩展 `AI_TOOLS` 数组
   - 影响文件：`src/extension.ts:109-121`

## 低优先级

6. **移除废弃配置项**
   - 清理 `terminalCommand` 和 `terminalName` 配置
   - 影响文件：`package.json`, `src/extension.ts`

7. **添加 CI/CD**
   - 设置 GitHub Actions 自动测试
   - 影响文件：创建 `.github/workflows/test.yml`

---

**文档版本**：v1.0  
**最后更新**：2025-10-24  
**作者**：Winston (Architect Agent)  
**目标读者**：熟悉 TypeScript 但不熟悉 VS Code API 的开发者、AI Bug 修复 Agents
