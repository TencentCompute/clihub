import * as vscode from 'vscode';

export const WORKSPACE_TOOL_KEY = 'selectedTool';
export const GLOBAL_DEFAULT_TOOL_KEY = 'defaultTool';
export const LEGACY_TOOL_KEY = 'lastSelectedTool';

export type ToolSelectionSource = 'workspace' | 'global' | 'config';

export interface ToolSelectionSnapshot {
  toolId: string;
  source: ToolSelectionSource;
}

export interface ToolSelectionOptions {
  context: vscode.ExtensionContext;
  tools: ReadonlyArray<{ id: string }>;
  defaultToolId: string;
  log?: vscode.LogOutputChannel;
}

function hasWorkspaceFolders(): boolean {
  return !!(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0);
}

function isValidToolId(toolId: string | undefined, tools: ReadonlyArray<{ id: string }>): toolId is string {
  if (typeof toolId !== 'string') {
    return false;
  }
  return tools.some(tool => tool.id === toolId);
}

export function describeSelectionSource(source: ToolSelectionSource): string {
  if (source === 'workspace') {
    return 'this workspace';
  }
  if (source === 'global') {
    return 'global default';
  }
  return 'extension default';
}

export function hasWorkspaceOverride(context: vscode.ExtensionContext): boolean {
  if (!hasWorkspaceFolders()) {
    return false;
  }
  return !!context.workspaceState.get<string>(WORKSPACE_TOOL_KEY);
}

export async function migrateLegacyToolSelection(context: vscode.ExtensionContext, log?: vscode.LogOutputChannel): Promise<void> {
  const legacyGlobalTool = context.globalState.get<string>(LEGACY_TOOL_KEY);
  const existingGlobalDefault = context.globalState.get<string>(GLOBAL_DEFAULT_TOOL_KEY);

  if (legacyGlobalTool && !existingGlobalDefault) {
    await context.globalState.update(GLOBAL_DEFAULT_TOOL_KEY, legacyGlobalTool);
    try {
      log?.info(`[CLI Hub] Migrated global tool selection: ${legacyGlobalTool}`);
    } catch { /* ignore */ }
  }

  if (legacyGlobalTool) {
    await context.globalState.update(LEGACY_TOOL_KEY, undefined);
  }
}

export function getToolSelectionSnapshot(options: ToolSelectionOptions): ToolSelectionSnapshot {
  const { context, tools, defaultToolId, log } = options;

  if (hasWorkspaceFolders()) {
    const workspaceChoice = context.workspaceState.get<string>(WORKSPACE_TOOL_KEY);
    if (workspaceChoice) {
      if (isValidToolId(workspaceChoice, tools)) {
        return { toolId: workspaceChoice, source: 'workspace' };
      }
      context.workspaceState.update(WORKSPACE_TOOL_KEY, undefined);
      try {
        log?.warn(`[CLI Hub] Workspace tool '${workspaceChoice}' is no longer available, cleared.`);
      } catch { /* ignore */ }
    }
  }

  const globalDefault = context.globalState.get<string>(GLOBAL_DEFAULT_TOOL_KEY);
  if (globalDefault) {
    if (isValidToolId(globalDefault, tools)) {
      return { toolId: globalDefault, source: 'global' };
    }
    context.globalState.update(GLOBAL_DEFAULT_TOOL_KEY, undefined);
    try {
      log?.warn(`[CLI Hub] Global default tool '${globalDefault}' is no longer available, cleared.`);
    } catch { /* ignore */ }
  }

  return {
    toolId: defaultToolId,
    source: 'config',
  };
}

export function getToolIdForWorkspace(options: ToolSelectionOptions): string {
  return getToolSelectionSnapshot(options).toolId;
}
