# Section 3: Technical Constraints and Integration Requirements

## 3.1 Technology Stack

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

## 3.2 Integration Approach

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

## 3.3 Code Organization

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

## 3.4 Deployment and Operations

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
