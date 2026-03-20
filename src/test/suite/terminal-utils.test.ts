import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  isGenericShellPath,
  shellPathMatchesTool,
  nodeWrapperMatchesTool,
  isGenericProcessName,
  summarizeTerminalOptions,
  shellArgsIncludeTool,
} from '../../terminal-utils';

describe('Unit: terminal-utils', () => {
  // 测试 isGenericShellPath 函数
  describe('isGenericShellPath()', () => {
    it('应识别常见 shell: zsh', () => {
      assert.strictEqual(isGenericShellPath('/bin/zsh'), true);
      assert.strictEqual(isGenericShellPath('/usr/bin/zsh'), true);
      assert.strictEqual(isGenericShellPath('zsh'), true);
    });

    it('应识别常见 shell: bash', () => {
      assert.strictEqual(isGenericShellPath('/bin/bash'), true);
      assert.strictEqual(isGenericShellPath('/usr/bin/bash'), true);
    });

    it('应识别常见 shell: sh', () => {
      assert.strictEqual(isGenericShellPath('/bin/sh'), true);
    });

    it('应识别 Windows shell: pwsh, powershell, cmd', () => {
      // 测试不含路径的纯命令名（跨平台兼容）
      assert.strictEqual(isGenericShellPath('pwsh'), true);
      assert.strictEqual(isGenericShellPath('powershell'), true);
      assert.strictEqual(isGenericShellPath('cmd'), true);
      assert.strictEqual(isGenericShellPath('cmd.exe'), true);
    });

    it('应识别 fish shell', () => {
      assert.strictEqual(isGenericShellPath('/usr/bin/fish'), true);
    });

    it('应识别 node 和 node.exe', () => {
      assert.strictEqual(isGenericShellPath('/usr/bin/node'), true);
      assert.strictEqual(isGenericShellPath('node'), true);
      assert.strictEqual(isGenericShellPath('node.exe'), true);
      // Windows 路径测试：仅测试纯文件名以保证跨平台兼容
      assert.strictEqual(isGenericShellPath('node.exe'), true);
    });

    it('对 undefined/null 应返回 false', () => {
      assert.strictEqual(isGenericShellPath(undefined), false);
      assert.strictEqual(isGenericShellPath(null as any), false);
    });

    it('对非通用路径应返回 false', () => {
      assert.strictEqual(isGenericShellPath('/usr/bin/gemini'), false);
      assert.strictEqual(isGenericShellPath('/usr/bin/codebuddy'), false);
      assert.strictEqual(isGenericShellPath('claude'), false);
    });
  });

  // 测试 shellPathMatchesTool 函数
  describe('shellPathMatchesTool()', () => {
    it('应精确匹配工具名', () => {
      assert.strictEqual(shellPathMatchesTool('/usr/bin/gemini', 'gemini'), true);
      assert.strictEqual(shellPathMatchesTool('gemini', 'gemini'), true);
      assert.strictEqual(shellPathMatchesTool('/usr/local/bin/codebuddy', 'codebuddy'), true);
    });

    it('应匹配 .cmd 后缀', () => {
      assert.strictEqual(shellPathMatchesTool('gemini.cmd', 'gemini'), true);
      // 使用 Unix 风格路径进行测试以保证跨平台兼容
      assert.strictEqual(shellPathMatchesTool('/tools/gemini.cmd', 'gemini'), true);
    });

    it('应匹配 .exe 后缀', () => {
      assert.strictEqual(shellPathMatchesTool('gemini.exe', 'gemini'), true);
      // 使用 Unix 风格路径进行测试以保证跨平台兼容
      assert.strictEqual(shellPathMatchesTool('/Program Files/gemini.exe', 'gemini'), true);
    });

    it('应不区分大小写', () => {
      assert.strictEqual(shellPathMatchesTool('Gemini', 'gemini'), true);
      assert.strictEqual(shellPathMatchesTool('GEMINI.EXE', 'gemini'), true);
      assert.strictEqual(shellPathMatchesTool('/usr/bin/Codebuddy', 'codebuddy'), true);
    });

    it('对 undefined shellPath 应返回 false', () => {
      assert.strictEqual(shellPathMatchesTool(undefined, 'gemini'), false);
    });

    it('不匹配的工具名应返回 false', () => {
      assert.strictEqual(shellPathMatchesTool('/usr/bin/bash', 'gemini'), false);
      assert.strictEqual(shellPathMatchesTool('node', 'gemini'), false);
    });
  });

  // 测试 shellArgsIncludeTool 函数
  describe('shellArgsIncludeTool()', () => {
    it('应在字符串类型 shellArgs 中查找工具名', () => {
      assert.strictEqual(shellArgsIncludeTool('/path/to/gemini --flag', 'gemini'), true);
      assert.strictEqual(shellArgsIncludeTool('--flag gemini', 'gemini'), true);
    });

    it('应在数组类型 shellArgs 中查找工具名', () => {
      assert.strictEqual(shellArgsIncludeTool(['/path/to/gemini', '--flag'], 'gemini'), true);
      assert.strictEqual(shellArgsIncludeTool(['--flag', 'gemini'], 'gemini'), true);
    });

    it('应不区分大小写', () => {
      assert.strictEqual(shellArgsIncludeTool('GEMINI --flag', 'gemini'), true);
      assert.strictEqual(shellArgsIncludeTool(['GEMINI'], 'gemini'), true);
    });

    it('对 undefined shellArgs 应返回 false', () => {
      assert.strictEqual(shellArgsIncludeTool(undefined, 'gemini'), false);
    });

    it('不包含工具名应返回 false', () => {
      assert.strictEqual(shellArgsIncludeTool('--flag --other', 'gemini'), false);
      assert.strictEqual(shellArgsIncludeTool(['--flag'], 'gemini'), false);
    });
  });

  // 测试 nodeWrapperMatchesTool 函数
  describe('nodeWrapperMatchesTool()', () => {
    it('shellPath=node 且 shellArgs 包含工具名时应返回 true', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellPath: 'node',
        shellArgs: ['/usr/local/lib/node_modules/gemini/bin/gemini.js'] as any,
      };
      assert.strictEqual(nodeWrapperMatchesTool(options, 'gemini'), true);
    });

    it('shellPath=node.exe 且 shellArgs 包含工具名时应返回 true', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellPath: 'node.exe',
        shellArgs: ['C:\\tools\\gemini\\index.js'] as any,
      };
      assert.strictEqual(nodeWrapperMatchesTool(options, 'gemini'), true);
    });

    it('shellPath 非 node 时应返回 false', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellPath: '/bin/bash',
        shellArgs: ['gemini'] as any,
      };
      assert.strictEqual(nodeWrapperMatchesTool(options, 'gemini'), false);
    });

    it('shellPath=node 但 shellArgs 不包含工具名时应返回 false', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellPath: 'node',
        shellArgs: ['other-script.js'] as any,
      };
      assert.strictEqual(nodeWrapperMatchesTool(options, 'gemini'), false);
    });

    it('对 undefined options 应返回 false', () => {
      assert.strictEqual(nodeWrapperMatchesTool(undefined, 'gemini'), false);
    });

    it('支持字符串形式的 shellArgs', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellPath: 'node',
        shellArgs: '/path/to/gemini/index.js' as any,
      };
      assert.strictEqual(nodeWrapperMatchesTool(options, 'gemini'), true);
    });
  });

  // 测试 isGenericProcessName 函数
  describe('isGenericProcessName()', () => {
    it('应识别 node 进程名', () => {
      assert.strictEqual(isGenericProcessName('node'), true);
    });

    it('应不区分大小写', () => {
      assert.strictEqual(isGenericProcessName('Node'), true);
      assert.strictEqual(isGenericProcessName('NODE'), true);
    });

    it('对非 node 进程名应返回 false', () => {
      assert.strictEqual(isGenericProcessName('bash'), false);
      assert.strictEqual(isGenericProcessName('zsh'), false);
      assert.strictEqual(isGenericProcessName('gemini'), false);
    });

    it('对 undefined 应返回 false', () => {
      assert.strictEqual(isGenericProcessName(undefined), false);
    });
  });

  // 测试 summarizeTerminalOptions 函数
  describe('summarizeTerminalOptions()', () => {
    it('应正确提取 name, shellPath, cwd', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test Terminal',
        shellPath: '/bin/bash',
        cwd: '/home/user',
      };
      const summary = summarizeTerminalOptions(options);
      assert.ok(summary.includes('name=Test Terminal'));
      assert.ok(summary.includes('shell=bash'));
      assert.ok(summary.includes('cwd=/home/user'));
    });

    it('应正确提取环境变量 CLIHUB_TERMINAL', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        env: {
          CLIHUB_TERMINAL: '1',
        },
      };
      const summary = summarizeTerminalOptions(options);
      assert.ok(summary.includes('env.HUB=1'));
    });

    it('应正确提取环境变量 CLIHUB_TOOL_ID', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
        env: {
          CLIHUB_TOOL_ID: 'gemini',
        },
      };
      const summary = summarizeTerminalOptions(options);
      assert.ok(summary.includes('env.TOOL=gemini'));
    });

    it('shellArgs 过长时应截断（>120 字符）', () => {
      const longArgs = 'a'.repeat(150);
      const options: vscode.TerminalOptions = {
        name: 'Test',
        shellArgs: [longArgs] as any,
      };
      const summary = summarizeTerminalOptions(options);
      assert.ok(summary.includes('…'));
      assert.ok(summary.length < 500);
    });

    it('对 undefined options 应返回 "undefined"', () => {
      const summary = summarizeTerminalOptions(undefined);
      assert.strictEqual(summary, 'undefined');
    });

    it('应处理缺失字段（使用 undefined 占位）', () => {
      const options: vscode.TerminalOptions = {
        name: 'Test',
      };
      const summary = summarizeTerminalOptions(options);
      assert.ok(summary.includes('shell=undefined'));
      assert.ok(summary.includes('cwd=undefined'));
    });
  });
});
