import * as vscode from "vscode";
import { createBranchAndMergeRequest } from "./commands/CreateBranchAndMergeRequest";
import { generateWeeklyReport } from "./commands/GenerateWeeklyReport";
import { updateCsvFile } from "./commands/UpdateCsvFile";

export function activate(context: vscode.ExtensionContext) {
  // 创建分支并创建 MR
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "Easier.createBranchAndMergeRequest",
      createBranchAndMergeRequest
    )
  );

  // 根据 Jira 信息生成周报
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "Easier.generateWeeklyReport",
      generateWeeklyReport
    )
  );

  // 更新 csv 内容
  context.subscriptions.push(
    vscode.commands.registerCommand("Easier.updateCsvFile", updateCsvFile)
  );
}

export function deactivate() {}
