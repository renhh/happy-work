import * as vscode from "vscode";
import { Version2Client } from "jira.js";

export const getJira = () => {
  const JIRA_HOST = vscode.workspace
    .getConfiguration("Easier.settings")
    .get("jiraHost") as string;

  const JIRA_ACCESS_TOKEN = vscode.workspace
    .getConfiguration("Easier.settings")
    .get("jiraUserPersonalAccessToken") as string;

  return new Version2Client({
    host: JIRA_HOST,
    authentication: {
      personalAccessToken: JIRA_ACCESS_TOKEN,
    },
  });
};
