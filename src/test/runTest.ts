import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // 扩展开发目录路径
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const testWorkspacePath = path.resolve(extensionDevelopmentPath, 'src/test/fixtures/workspace');

    // 测试套件入口文件路径
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // 下载并启动 VS Code，然后运行测试
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      // 可选：指定启动参数
      launchArgs: [
        testWorkspacePath,
        '--disable-extensions', // 禁用其他扩展，避免干扰测试
        '--disable-gpu',
        '--disable-updates',
        '--skip-welcome',
        '--skip-release-notes',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();
