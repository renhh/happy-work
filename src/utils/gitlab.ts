import * as vscode from "vscode";
import { Gitlab } from "@gitbeaker/node";

export const getGitlab = () => {
  const GITLAB_HOST = vscode.workspace
    .getConfiguration("Easier.settings")
    .get("gitlabHost") as string;

  const GITLAB_ACCESS_TOKEN = vscode.workspace
    .getConfiguration("Easier.settings")
    .get("gitlabUserPersonalAccessToken") as string;

  return new Gitlab({
    host: GITLAB_HOST,
    token: GITLAB_ACCESS_TOKEN,
  });
};
