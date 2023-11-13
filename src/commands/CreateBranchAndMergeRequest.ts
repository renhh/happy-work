import * as vscode from "vscode";

import { showMessage } from "../utils/common";
import { getJira } from "../utils/jira";
import { getGit } from "../utils/git";
import { getGitlab } from "../utils/gitlab";

// 远程分支前缀
const REMOTE_BRANCH_PREFIX = "remotes/origin/";

const jira = getJira();
const git = getGit();
const gitlab = getGitlab();

export const createBranchAndMergeRequest = async () => {
  try {
    showMessage("正在请求数据");
    // 获取 jira 信息、用户信息、所有分支信息、远程仓库地址
    const { issues, user, branchInfo, remote } = await fetchData();

    const jiraOptions =
      issues.issues?.map(
        (issue) => `【${issue.key}】${issue.fields.summary}`
      ) || [];

    // 显示选择框并获取 jira issue
    const title =
      (await vscode.window.showQuickPick(jiraOptions, {
        placeHolder: "选择一个 jira 作为当前需求",
      })) || "";

    if (!title) {
      showMessage("必须选择一个 jira 作为当前需求", "error");
      return;
    }

    // 显示选择框并获取用户选项
    const sourceBranch =
      (await vscode.window.showQuickPick(branchInfo.all, {
        placeHolder: "选择一个 ref 以从中创建分支，默认为 master",
      })) || "master";

    const newBranchName = getBranchName(title, user.name, branchInfo);

    showMessage("生成中，请稍候");

    // 根据源分支创建新分支，并切换到新分支
    await git.checkoutBranch(newBranchName, sourceBranch);
    // 将新分支推送到远程仓库
    await git.push(["-u", "origin", newBranchName, "--no-verify"]);

    // 获取 projectId
    const projectId = remote.match(/^.*:(.*)\.git$/)[1];

    const mergeRequest = await gitlab.MergeRequests.create(
      projectId,
      newBranchName,
      sourceBranch.replace(REMOTE_BRANCH_PREFIX, ""),
      title,
      { assigneeId: user.id }
    );

    showMessage(
      `已切换至新分支「${newBranchName}」，MR 地址：${mergeRequest.web_url}`
    );
  } catch (error) {
    showMessage(String(error), "error");
  }
};

async function fetchData() {
  const [issues, user, branchInfo, { value: remote }] = await Promise.all([
    jira.issueSearch.searchForIssuesUsingJqlPost({
      // 当前用户 并且 解决状态为 未解决
      jql: "assignee = currentUser() AND resolution = Unresolved ORDER BY priority, created DESC",
    }),
    gitlab.Users.current(),
    git.branch(),
    git.getConfig("remote.origin.url"),
  ]);

  return { issues, user, branchInfo, remote };
}

function getBranchName(jira: string, userName: string, branchInfo: any) {
  const branchName = `wip/${userName}/${jira
    .match(/【(.*?)】/)?.[1]
    .toLowerCase()}`;

  let newBranchName = branchName;
  // 判断分支是不是唯一的
  let isOnly = false;
  let index = 1;

  while (!isOnly) {
    // 是否已经存在当前分支
    if (
      branchInfo.all.some(
        (branch: string) =>
          branch === newBranchName ||
          branch === REMOTE_BRANCH_PREFIX + newBranchName
      )
    ) {
      newBranchName = branchName + "-" + index;
      index += 1;
    } else {
      isOnly = true;
    }
  }

  return newBranchName;
}
