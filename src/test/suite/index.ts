import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  // 创建 Mocha 测试实例
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 10000, // 集成测试可能需要更长时间
  });

  const testsRoot = path.resolve(__dirname, '..');

  // 查找所有 .test.js 文件
  const files = await glob('**/**.test.js', { cwd: testsRoot });

  // 将测试文件添加到 Mocha 实例
  files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise<void>((resolve, reject) => {
    try {
      // 运行 Mocha 测试
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error('Error running tests:', err);
      reject(err);
    }
  });
}
