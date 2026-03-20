# Product Requirements Document - Custom CLI Arguments Configuration

## Document Information

**版本**: 0.2.0  
**状态**: Done  
**最后更新**: 2025-10-30  
**负责人**: Product Manager (John)

---

## Section 1: Project Analysis

### 1.1 Existing Project Overview

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

### 1.2 Documentation Analysis

**现有文档**:
- `docs/brownfield-architecture.md`: 当前系统状态的全面技术文档
- `README.md` / `README_EN.md`: 面向用户的功能和使用文档
- `CHANGELOG.md`: 版本历史和变更记录

**文档缺口**:
- 缺少高级工具参数的配置示例
- 自定义工具行为的指导有限
- 没有工具特定参数需求的文档

### 1.3 Enhancement Scope

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

## Section 2: Requirements

### 2.1 Functional Requirements

**FR1: 配置模式**
- 系统应在 VS Code 设置中提供 `codebuddy.toolArguments` 配置项
- 配置应支持所有 6 个 AI 工具: codebuddy、gemini、claude、codex、copilot、cursor-agent
- 每个工具应接受包含命令行参数的字符串值
- 空/未定义的配置应默认为无自定义参数

**FR2: 设置 UI**
- 用户应通过 VS Code 设置 UI 访问工具参数配置
- 设置 UI 应为每个 AI 工具显示清晰的标签
- 每个工具配置应显示描述和示例用法
- 配置更改应在 VS Code 重启后保持

**FR3: 参数注入**
- 系统应在启动终端时从配置中读取自定义参数
- 参数应在终端创建前正确附加到工具命令中
- 参数解析应正确处理空格、引号和特殊字符
- 单个字符串中的多个参数应正确解析和应用

**FR4: 向后兼容性**
- 未配置自定义参数的工具应以当前默认行为启动
- 对于默认情况，现有终端创建逻辑应保持不变
- 不应对现有用户工作流或配置造成破坏性更改

**FR5: 错误处理**
- 系统应验证参数格式并为无效输入显示清晰的错误消息
- 格式错误的参数字符串不应阻止终端创建
- 用户应收到关于参数解析问题的反馈

**FR6: 多工具支持**
- 每个 AI 工具应支持独立的参数配置
- 对一个工具参数的更改不应影响其他工具
- 系统应处理工具特定的参数需求和格式

**FR7: 文档**
- README 应包含"自定义参数"部分及配置示例
- 应为每个支持的 AI 工具提供示例，包括常用的 YOLO 模式参数:
  - **Copilot**: `--allow-all-tools` (允许所有工具访问)
  - **Claude**: `--dangerously-skip-permissions` (跳过权限检查)
  - **Codebuddy**: `--dangerously-skip-permissions` (跳过权限检查)
  - **Codex**: `--full-auto` (全自动模式)
  - **Gemini**: `--yolo` (自动确认模式)
  - **Cursor Agent**: `--force` 或 `-f` (强制允许命令执行)
- 应记录常见用例和风险提示（YOLO 模式可能带来安全风险）
- 应包含常见参数问题的故障排除指导

### 2.2 Non-Functional Requirements

**NFR1: 性能**
- 参数注入不应在终端创建中引入明显延迟
- 配置读取应高效（< 50ms）
- 参数解析应处理长达 1000 个字符的字符串

**NFR2: 可用性**
- 设置 UI 应直观，无需技术文档即可使用
- 配置示例应可直接复制粘贴
- 错误消息应可操作且用户友好

**NFR3: 可维护性**
- 代码更改应最小化并局限于终端创建逻辑
- 配置模式应可扩展以支持未来的 AI 工具添加
- 参数解析逻辑应可独立测试

**NFR4: 可靠性**
- 无效参数不应导致扩展崩溃或阻止终端创建
- 系统应优雅地处理边缘情况（空字符串、特殊字符、长参数）
- 回退行为应维持当前功能

**NFR5: 安全性**
- 参数注入不应引入命令注入漏洞
- 用户提供的参数应经过适当清理以进行 shell 执行
- 配置值应在使用前验证

### 2.3 Compatibility Requirements

**CR1: VS Code 版本**
- 支持 VS Code ^1.99.0（当前最低版本）
- 配置模式应使用标准 VS Code contribution points
- 设置 UI 应遵循 VS Code 设计指南

**CR2: 现有配置**
- 现有的 `codebuddy.terminalCommand`、`codebuddy.terminalName` 和 `codebuddy.bracketedPasteHack` 设置应保持功能
- 新配置不应与现有设置冲突
- 现有用户不需要配置迁移

**CR3: AI 工具兼容性**
- 自定义参数应适用于所有 6 个支持的 AI 工具
- 系统不应验证工具特定参数的正确性（工具处理验证）
- 参数应原样传递给工具，不做修改

**CR4: 平台兼容性**
- 参数注入应在 macOS、Windows 和 Linux 上工作
- 应正确处理 shell 特定的参数格式
- 路径分隔符和特殊字符应适合平台

---

## Section 3: Technical Constraints and Integration Requirements

### 3.1 Technology Stack

**当前技术栈**（来自 brownfield-architecture.md）:
- **运行时**: Node.js（VS Code 内嵌）
- **语言**: TypeScript 5.9.3（启用严格模式）
- **框架**: VS Code Extension API ^1.99.0
- **构建系统**: TypeScript 编译器（tsc）
- **包管理器**: npm

**依赖项**:
- `@types/vscode`: ^1.99.0（类型定义的开发依赖）
- 除 VS Code API 外无运行时依赖

**约束条件**:
- 必须专门使用 VS Code Extension API（无外部终端库）
- 需要 TypeScript 严格模式合规
- 应尽可能维持单文件架构
- package.json 激活事件不应有破坏性更改

### 3.2 Integration Approach

**配置方法验证**:
- ✅ 当前项目已验证使用 `contributes.configuration` 方法
- ✅ 现有设置 `codebuddy.terminalCommand`、`codebuddy.terminalName` 等已成功集成到 VS Code 设置 UI
- ✅ 使用 `workspace.getConfiguration('codebuddy')` 读取配置已验证可行
- 此方法是 VS Code Extension API 的标准做法，确保新配置能正常工作

**与现有系统的集成点**:

1. **package.json 配置模式**
   - 为 `codebuddy.toolArguments` 添加 `contributes.configuration` 条目
   - **验证**: 当前项目已使用 `contributes.configuration` 成功配置了 `codebuddy.terminalCommand` 等设置，证明此方法有效
   - 模式结构（在现有 `properties` 中添加）:
     ```json
     "codebuddy.toolArguments": {
       "type": "object",
       "default": {},
       "markdownDescription": "每个 AI 工具的自定义命令行参数。常用 YOLO 模式示例：\n- Copilot: `--allow-all-tools`\n- Claude: `--dangerously-skip-permissions`\n- Codebuddy: `--dangerously-skip-permissions`\n- Codex: `--full-auto`\n- Gemini: `--yolo`\n- Cursor Agent: `--force`",
       "order": 4,
       "properties": {
         "codebuddy": { 
           "type": "string", 
           "default": "",
           "description": "Codebuddy CLI 参数（YOLO 模式: --dangerously-skip-permissions）"
         },
         "gemini": { 
           "type": "string", 
           "default": "",
           "description": "Gemini CLI 参数（YOLO 模式: --yolo）"
         },
         "claude": { 
           "type": "string", 
           "default": "",
           "description": "Claude Code 参数（YOLO 模式: --dangerously-skip-permissions）"
         },
         "codex": { 
           "type": "string", 
           "default": "",
           "description": "Codex 参数（YOLO 模式: --full-auto）"
         },
         "copilot": { 
           "type": "string", 
           "default": "",
           "description": "GitHub Copilot CLI 参数（YOLO 模式: --allow-all-tools）"
         },
         "cursor-agent": { 
           "type": "string", 
           "default": "",
           "description": "Cursor Agent 参数（YOLO 模式: --force 或 -f）"
         }
       }
     }
     ```

2. **终端创建逻辑（extension.ts）**
   - 位置: `openTerminalEditor` 命令（约第 331 行）
   - 当前流程: 读取配置 → 构建命令 → 创建终端
   - 增强: 在配置读取后、终端创建前插入参数注入步骤
   - 保留 `terminalCommand`、`terminalName`、`bracketedPasteHack` 的现有逻辑

3. **参数解析和注入**
   - 读取配置: `workspace.getConfiguration('codebuddy').get<object>('toolArguments')`
   - 根据选择的 AI 工具 ID 提取工具特定参数
   - 将字符串解析为参数数组（处理引号、空格、转义）
   - 在 `window.createTerminal()` 调用前注入到 `shellArgs` 数组中

4. **错误处理集成**
   - 扩展现有错误消息模式
   - 在终端创建前添加验证
   - 通过 VS Code 信息/错误消息提供用户反馈

**集成验证**:
- 所有 6 个 AI 工具必须在没有自定义参数的情况下成功启动（回归测试）
- 配置后每个工具必须正确接收自定义参数
- 现有终端状态管理必须保持功能
- 配置更改必须在下次终端启动时生效

### 3.3 Code Organization

**文件结构**（最小更改）:
- `src/extension.ts`: 在 `openTerminalEditor` 命令中添加参数注入逻辑
- `package.json`: 添加配置模式贡献
- `README.md` / `README_EN.md`: 添加配置文档
- `CHANGELOG.md`: 记录版本 0.2.0 更改

**编码标准**（来自 brownfield-architecture.md）:
- TypeScript 严格模式合规
- 遵循现有代码风格和模式
- 使用 VS Code API 工具进行 shell 安全操作
- 尽可能维持单文件架构
- 为参数解析逻辑添加内联注释

**测试考虑**:
- 对每个 AI 工具进行有/无自定义参数的手动测试
- 边缘情况测试: 空字符串、特殊字符、长参数
- 平台测试: 如可能在 macOS、Windows、Linux 上验证
- 回归测试: 确保现有功能不变

### 3.4 Deployment and Operations

**部署策略**:
- 版本升级: 0.0.6 → 0.2.0（新功能的次版本）
- 打包为 .vsix 文件进行分发
- 使用版本 0.2.0 发布说明更新 CHANGELOG.md
- 如适用考虑市场发布

**回滚计划**:
- 可以通过清除设置中的自定义参数来禁用功能
- 不需要数据库或持久状态更改
- 终端创建回退维持当前行为
- 最坏情况: 回退到版本 0.0.6 包

**监控**:
- 当前未实现遥测或监控
- 通过用户反馈进行手动验证
- 错误日志在 VS Code 开发者工具控制台中可见

**配置管理**:
- 设置存储在 VS Code 工作区/用户设置 JSON 中
- 配置更改自动持久化
- 现有用户无需迁移
- 默认行为保持向后兼容性

---

## Section 4: Epic and Story Structure

### Epic Structure

**Epic 1: Custom CLI Arguments Configuration**

此 Epic 使用户能够为每个 AI 工具配置自定义命令行参数，在不破坏现有功能的情况下增强灵活性。

**Story 分解**:

1. **Story 1.1: Configuration Schema and UI**
   - 向 package.json 添加配置模式
   - 在 VS Code 中实现设置 UI
   - 支持自定义参数的字符串格式
   - 验证参数格式

2. **Story 1.2: Terminal Command Integration**
   - 修改终端创建逻辑以注入自定义参数
   - 更新 `openTerminalEditor` 中的命令构建
   - 未配置自定义参数时保留现有工具行为
   - 处理参数解析和验证

3. **Story 1.3: Documentation and Testing**
   - 使用自定义参数功能更新 README
   - 为每个 AI 工具添加配置示例
   - 为参数注入创建集成测试
   - 验证与现有安装的向后兼容性

### 单 Epic 结构的理由

- **功能内聚**: 所有 stories 朝着一个面向用户的功能工作
- **可管理范围**: 3 个专注的 stories 可以在一个开发周期内完成
- **顺序依赖**: Stories 按逻辑顺序相互构建（模式 → 实现 → 文档）
- **风险管理**: 每个 story 保持系统稳定性并可独立验证
- **版本对齐**: 单个 epic 与版本 0.2.0 次要发布对齐

### Story 排序逻辑

顺序确保:
1. **基础优先**: 配置模式建立数据结构
2. **核心实现**: 终端集成实现功能
3. **完整性**: 文档和测试确保生产就绪

每个 story 包括验证现有 AI 工具功能保持不变。

---

## Section 5: Epic Details with Stories

### Epic 1: Custom CLI Arguments Configuration

**Epic 目标**: 使用户能够为每个 AI 工具配置自定义命令行参数，为高级用例提供灵活性，同时保持与现有工作流的向后兼容性。

**Epic 优先级**: 高（v0.2.0 核心功能）

**Epic 状态**: 计划中

---

#### Story 1.1: Configuration Schema and UI

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

#### Story 1.2: Terminal Command Integration

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

#### Story 1.3: Documentation and Testing

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

### Epic 完成标准

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

## Document Completion

**PRD 状态**: 完成  
**后续步骤**:
1. 审查和批准 PRD
2. 开始 Story 1.1 实现
3. 将 stories 分配到开发周期
4. 安排测试和验证

**变更日志**:
- 2025-10-30: 为版本 0.2.0 自定义参数功能创建初始 PRD

---

## 附录 A: 常用 CLI 参数参考

### YOLO 模式参数（跳过权限/自动模式）

⚠️ **安全警告**: 以下参数会跳过安全检查或启用自动操作模式，使用时请充分理解风险。

| AI 工具 | 参数 | 功能说明 | 风险等级 |
|---------|------|----------|----------|
| **Copilot** | `--allow-all-tools` | 允许访问所有工具和系统功能 | 🔴 高 |
| **Claude** | `--dangerously-skip-permissions` | 跳过权限确认，自动执行操作 | 🔴 高 |
| **Codebuddy** | `--dangerously-skip-permissions` | 跳过权限确认，自动执行操作 | 🔴 高 |
| **Codex** | `--full-auto` | 完全自动化模式，无需人工确认 | 🔴 高 |
| **Gemini** | `--yolo` | 自动确认所有操作 | 🔴 高 |
| **Cursor Agent** | `--force` 或 `-f` | 强制允许命令执行（除非明确拒绝） | 🔴 高 |

### 其他常用参数

| AI 工具 | 参数 | 功能说明 |
|---------|------|----------|
| **通用** | `--verbose` | 输出详细日志信息 |
| **通用** | `--debug` | 启用调试模式 |
| **通用** | `--help` | 显示帮助信息 |

### 配置示例

**保守配置**（推荐用于生产环境）:
```json
{
  "codebuddy.toolArguments": {
    "copilot": "",
    "claude": "",
    "codebuddy": "",
    "codex": "",
    "cursor-agent": ""
  }
}
```

**YOLO 模式配置**（适用于个人开发/实验）:
```json
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

**混合配置**（根据需要启用）:
```json
{
  "codebuddy.toolArguments": {
    "copilot": "--verbose",
    "claude": "",
    "codebuddy": "--dangerously-skip-permissions",
    "codex": "",
    "gemini": "--yolo",
    "cursor-agent": "--force"
  }
}
```-f, --force    Force allow commands unless explicitly denied

### 使用建议

1. **首次使用**: 建议不配置任何参数，使用默认安全模式
2. **开发环境**: 可以根据需要启用 YOLO 模式提高效率
3. **生产环境**: 强烈建议使用默认安全模式或仅启用 `--verbose` 等安全参数
4. **团队协作**: 在团队配置文件中记录使用这些参数的原因和风险

### 参数更新

参数列表会随着各 CLI 工具的更新而变化，建议:
- 查阅各工具的官方文档获取最新参数
- 使用 `<tool-name> --help` 查看可用参数
- 在更新工具版本后测试配置的参数是否仍然有效