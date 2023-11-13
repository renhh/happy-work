import * as vscode from "vscode";

const simpleGit = require("simple-git");
const path = require("path");

export const getGit = () => {
  // 获取宿主项目的本地 git 存储库路径
  const repoPath = path.join(
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    ".git",
    ".."
  );

  return simpleGit(repoPath);
};
