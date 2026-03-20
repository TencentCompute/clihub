# Section 5: Epic Details with Stories

## Epic 1: Custom CLI Arguments Configuration

**Epic 目标**: 使用户能够为每个 AI 工具配置自定义命令行参数，为高级用例提供灵活性，同时保持与现有工作流的向后兼容性。

**Epic 优先级**: 高（v0.2.0 核心功能）

**Epic 状态**: 计划中

---

### Story 1.1: Configuration Schema and UI

**Story**: 作为用户，我希望通过 VS Code 设置为 AI 工具配置自定义参数，以便我可以在不修改代码的情况下传递工具特定参数。

**验收标准**:
1. 在 package.json 中添加配置模式，包含 `codebuddy.toolArguments` 设置
2. 设置 UI 允许为每个 AI 工具（codebuddy、gemini、claude、codex、copilot、cursor-agent）输入字符串
3. 配置接受有效的命令行参数字符串（例如 "--allow-all-tools --verbose"）
4. 空/未定义的配置默认为无自定义参数
5. 无效的参数格式显示清晰的验证消息
6. 现有工具配置不受影响

**集成验证**:
- 测试在未配置自定义参数的情况下现有 AI 工具启动正常工作
- 验证 VS Code 设置 UI 为所有 6 个工具正确渲染
- 确认配置更改在 VS Code 重启后持久化

**技术说明**:
- 在 package.json 中使用 VS Code 的 `contributes.configuration`
- 属性类型: 为每个工具 ID 提供属性的 `object`
- 每个工具属性类型: 带有描述和默认值 "" 的 `string`
- 遵循 `codebuddy.terminalCommand` 的现有配置模式

---

### Story 1.2: Terminal Command Integration

**Story**: 作为开发者，我希望自定义参数自动注入到 AI 工具命令中，以便在终端启动时应用配置的参数。

**验收标准**:
1. `openTerminalEditor` 命令从配置中读取自定义参数
2. 参数在终端创建前正确附加到工具命令
3. 参数解析正确处理空格、引号和特殊字符
4. 未配置自定义参数时现有工具行为不变
5. 单个字符串中的多个参数正确解析
6. 对格式错误的参数字符串进行错误处理并提供用户反馈

**集成验证**:
- 在没有自定义参数的情况下启动每个 AI 工具 - 验证正常操作
- 使用自定义参数启动每个 AI 工具 - 验证参数出现在终端命令中
- 使用复杂参数字符串测试: "--flag value --another-flag 'quoted value'"
- 确认终端状态管理和生命周期无回归

**技术说明**:
- 在 `openTerminalEditor` 中修改终端创建（约第 331 行）
- 读取配置: `workspace.getConfiguration('codebuddy').get<object>('toolArguments')`
- 在 `createTerminal` 之前将参数注入到 `shellArgs` 数组中
- 使用 shell 安全的参数解析（考虑 VS Code 的工具）
- 保留 `terminalCommand`、`terminalName`、`bracketedPasteHack` 的现有逻辑

**回滚考虑**:
- 可以通过清除设置中的自定义参数来禁用功能
- 不需要数据库或持久状态更改
- 终端创建回退维持当前行为

---

### Story 1.3: Documentation and Testing

**Story**: 作为用户，我希望有清晰的自定义参数文档和示例，以便我可以正确配置工具而无需反复试错。

**验收标准**:
1. README.md 更新包含"自定义参数"部分
2. 为每个支持的 AI 工具提供配置示例，包括常用 YOLO 模式:
   - Copilot: `--allow-all-tools`
   - Claude: `--dangerously-skip-permissions`
   - Codebuddy: `--dangerously-skip-permissions`
   - Codex: `--full-auto`
   - Gemini: `--yolo`
   - Cursor Agent: `--force` 或 `-f`
3. 记录常见用例和安全警告（YOLO 模式风险）
4. 为版本 0.2.0 更新 CHANGELOG.md
5. 集成测试覆盖参数注入场景
6. 测试验证向后兼容性

**集成验证**:
- 文档示例针对实际扩展进行测试
- 所有 6 个 AI 工具都有参数示例
- 链接到官方工具文档以供参数参考
- 版本 0.2.0 发布说明准确完整

**技术说明**:
- 更新 README.md 和 README_EN.md
- 在代码块中添加配置 JSON 示例，包括常用 YOLO 模式参数
- 添加配置示例部分:
  ```json
  // VS Code settings.json 示例 - YOLO 模式
  {
    "codebuddy.toolArguments": {
      "copilot": "--allow-all-tools",
      "claude": "--dangerously-skip-permissions",
      "codebuddy": "--dangerously-skip-permissions",
      "codex": "--full-auto",
      "gemini": "--yolo",
      "cursor-agent": "--force"
    }
  }
  ```
- 添加安全警告: YOLO 模式参数会跳过安全检查，使用时需理解风险
- 包含常见参数问题的故障排除部分
- 如果存在测试基础设施，考虑在 `src/test/` 中添加自动化测试

---

## Epic 完成标准

**完成定义**:
- [ ] 所有 3 个 stories 完成并满足验收标准
- [ ] 使用所有 AI 工具测试配置模式
- [ ] 现有功能回归测试
- [ ] 文档发布并审查
- [ ] 版本 0.2.0 发布并更新 CHANGELOG

**风险缓解**:
- **主要风险**: 破坏现有终端创建逻辑
  - **缓解**: 在未配置自定义参数的情况下进行广泛测试
  - **验证**: 在发布前以默认模式运行所有 6 个 AI 工具

- **次要风险**: 参数解析错误导致终端失败
  - **缓解**: 输入验证和错误处理并提供用户反馈
  - **验证**: 使用各种参数格式和边缘情况进行测试

---
