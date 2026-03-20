# Introduction

本文档记录了 Codebuddy Terminal Editor VS Code 扩展的**当前实际状态**，包括技术债务、已知问题和实际使用的模式。本文档旨在为 AI agents 提供准确的参考，以便进行 bug 修复和功能增强。

## Document Scope

全面记录整个系统的当前状态，重点关注：
- 终端生命周期管理（最复杂的部分）
- 多 AI 工具切换机制
- 已知问题和技术债务

## Change Log

| Date       | Version | Description          | Author    |
|------------|---------|----------------------|-----------|
| 2025-10-24 | 1.0     | 初始 brownfield 分析 | Winston (Architect) |
| 2025-10-24 | 1.1     | 更新：移除已修复的 group 自动关闭问题 | Winston (Architect) |
