## 1. Implementation
- [x] 1.1 在扩展配置中新增 `clihub.nativeTerminalLocation`
- [x] 1.2 在原生终端打开/复用路径中接入 `right` 右移逻辑
- [x] 1.3 更新当前架构文档中的终端位置配置说明
- [x] 1.4 为终端打开、新建、发送路径补充位置相关集成测试

## 2. Validation
- [x] 2.1 `npm run compile`
- [x] 2.2 `npm run test:integration -- --grep 'Terminal Adoption'`
- [x] 2.3 `openspec validate add-native-terminal-location-config --strict`
