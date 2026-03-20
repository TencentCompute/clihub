# 附录 A: 常用 CLI 参数参考

## YOLO 模式参数（跳过权限/自动模式）

⚠️ **安全警告**: 以下参数会跳过安全检查或启用自动操作模式，使用时请充分理解风险。

| AI 工具 | 参数 | 功能说明 | 风险等级 |
|---------|------|----------|----------|
| **Copilot** | `--allow-all-tools` | 允许访问所有工具和系统功能 | 🔴 高 |
| **Claude** | `--dangerously-skip-permissions` | 跳过权限确认，自动执行操作 | 🔴 高 |
| **Codebuddy** | `--dangerously-skip-permissions` | 跳过权限确认，自动执行操作 | 🔴 高 |
| **Codex** | `--full-auto` | 完全自动化模式，无需人工确认 | 🔴 高 |
| **Gemini** | `--yolo` | 自动确认所有操作 | 🔴 高 |
| **Cursor Agent** | `--force` 或 `-f` | 强制允许命令执行（除非明确拒绝） | 🔴 高 |

## 其他常用参数

| AI 工具 | 参数 | 功能说明 |
|---------|------|----------|
| **通用** | `--verbose` | 输出详细日志信息 |
| **通用** | `--debug` | 启用调试模式 |
| **通用** | `--help` | 显示帮助信息 |

## 配置示例

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

## 使用建议

1. **首次使用**: 建议不配置任何参数，使用默认安全模式
2. **开发环境**: 可以根据需要启用 YOLO 模式提高效率
3. **生产环境**: 强烈建议使用默认安全模式或仅启用 `--verbose` 等安全参数
4. **团队协作**: 在团队配置文件中记录使用这些参数的原因和风险

## 参数更新

参数列表会随着各 CLI 工具的更新而变化，建议:
- 查阅各工具的官方文档获取最新参数
- 使用 `<tool-name> --help` 查看可用参数
- 在更新工具版本后测试配置的参数是否仍然有效