import * as vscode from "vscode";

export const showMessage = (
  message: string,
  type?: "info" | "error" | "warning"
) => {
  if (type === "error") {
    vscode.window.showErrorMessage(message);
  } else if (type === "warning") {
    vscode.window.showWarningMessage(message);
  } else {
    vscode.window.showInformationMessage(message);
  }
};
