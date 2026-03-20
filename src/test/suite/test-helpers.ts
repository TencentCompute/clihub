import * as vscode from 'vscode';

/**
 * 等待条件满足
 * @param predicate 判断条件的函数
 * @param timeout 超时时间（毫秒）
 * @param interval 检查间隔（毫秒）
 * @returns Promise<boolean> 条件是否在超时前满足
 */
export async function waitForCondition(
  predicate: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(predicate());
    if (result) {
      return true;
    }
    await delay(interval);
  }

  return false;
}

/**
 * 延迟指定时间
 * @param ms 延迟时间（毫秒）
 */
export function delay(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * 清理所有测试终端
 */
export async function disposeAllTerminals(): Promise<void> {
  const terminals = [...vscode.window.terminals];

  for (const terminal of terminals) {
    try {
      terminal.dispose();
    } catch (err) {
      // 忽略错误
      console.error('Failed to dispose terminal:', err);
    }
  }

  // 等待终端关闭
  await delay(100);
}

/**
 * 创建模拟终端选项
 */
export function createMockTerminalOptions(overrides?: Partial<vscode.TerminalOptions>): vscode.TerminalOptions {
  const defaults: vscode.TerminalOptions = {
    name: 'Test Terminal',
    shellPath: '/bin/bash',
    env: {},
  };

  return { ...defaults, ...overrides };
}

/**
 * 等待终端打开
 */
export async function waitForTerminalOpen(timeout: number = 2000): Promise<vscode.Terminal | undefined> {
  return new Promise((resolve) => {
    const disposable = vscode.window.onDidOpenTerminal((terminal) => {
      disposable.dispose();
      resolve(terminal);
    });

    setTimeout(() => {
      disposable.dispose();
      resolve(undefined);
    }, timeout);
  });
}
