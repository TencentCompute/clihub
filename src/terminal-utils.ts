import * as path from 'path';
import * as vscode from 'vscode';

// 判断是否为扩展终端选项
export function isExtensionTerminalOptions(options: vscode.TerminalOptions | vscode.ExtensionTerminalOptions): options is vscode.ExtensionTerminalOptions {
  return 'pty' in options;
}

// 获取普通终端的创建选项
export function getTerminalOptions(terminal: vscode.Terminal): vscode.TerminalOptions | undefined {
  const options = terminal.creationOptions;
  if (isExtensionTerminalOptions(options)) {
    return undefined;
  }
  return options as vscode.TerminalOptions;
}

// 判断是否为通用进程名（VS Code 显示的简化进程标签），常见如 node
export function isGenericProcessName(name: string | undefined): boolean {
  if (!name) return false;
  const l = name.toLowerCase();
  return l === 'node';
}

// 判断是否为通用 shell 二进制名（用于 DRY 统一判定）
export function isGenericShellPath(shellPath: string | undefined): boolean {
  if (!shellPath) return false;
  const base = path.basename(shellPath).toLowerCase();
  const generic = new Set(['zsh','bash','sh','pwsh','powershell','cmd','cmd.exe','fish','node','node.exe']);
  return generic.has(base);
}

// 匹配 shellPath 的二进制名
export function shellPathMatchesTool(shellPath: string | undefined, toolId: string): boolean {
  if (!shellPath) {
    return false;
  }
  const basename = path.basename(shellPath).toLowerCase();
  const expected = toolId.toLowerCase();
  return basename === expected ||
    basename === `${expected}.cmd` ||
    basename === `${expected}.exe`;
}

// shellArgs 中是否包含工具 ID
export function shellArgsIncludeTool(shellArgs: string | readonly string[] | undefined, toolId: string): boolean {
  if (!shellArgs) return false;
  const s = Array.isArray(shellArgs) ? shellArgs.join(' ') : String(shellArgs);
  return s.toLowerCase().includes(toolId.toLowerCase());
}

// 是否为 node 包装器调用了目标工具
export function nodeWrapperMatchesTool(options: vscode.TerminalOptions | undefined, toolId: string): boolean {
  if (!options) return false;
  const shellPath = options.shellPath;
  if (!shellPath) return false;
  const base = path.basename(shellPath).toLowerCase();
  if (base !== 'node' && base !== 'node.exe') return false;
  const args = (options as vscode.TerminalOptions & { shellArgs?: string | readonly string[] }).shellArgs;
  return shellArgsIncludeTool(args, toolId);
}

// 汇总终端创建选项，便于日志调试
export function summarizeTerminalOptions(options: vscode.TerminalOptions | undefined): string {
  if (!options) return 'undefined';
  const name = options.name ?? 'undefined';
  const shell = options.shellPath ? path.basename(options.shellPath) : 'undefined';
  let args: string = 'undefined';
  const shellArgs = (options as any).shellArgs as string | string[] | undefined;
  if (Array.isArray(shellArgs)) args = shellArgs.join(' ');
  else if (typeof shellArgs === 'string') args = shellArgs;
  if (args && args.length > 120) args = args.slice(0, 120) + '…';
  const cwd = (options as any).cwd ?? 'undefined';
  const env = (options.env ?? {}) as Record<string, string | undefined>;
  const envFlag = env['CLIHUB_TERMINAL'] ?? 'undefined';
  const toolId = env['CLIHUB_TOOL_ID'] ?? 'undefined';
  return `name=${name} shell=${shell} cwd=${cwd} shellArgs=${args} env.HUB=${envFlag} env.TOOL=${toolId}`;
}
