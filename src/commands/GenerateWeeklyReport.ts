import * as vscode from "vscode";
import * as moment from "moment";

import { showMessage } from "../utils/common";
import { getJira } from "../utils/jira";

const exceljs = require("exceljs");
const path = require("path");
const os = require("os");

const jira = getJira();

const DATE_FORMAT = "YYYY/MM/DD";

export const generateWeeklyReport = async () => {
  try {
    // 获取本周周一和周五的日期
    const startDate = moment().startOf("isoWeek").format(DATE_FORMAT);
    const endDate = moment()
      .endOf("isoWeek")
      .subtract(2, "d")
      .format(DATE_FORMAT);
    const dateStr = `${startDate}-${endDate}`;

    // 获取上周一和周五的日期
    const prevStartDate = moment()
      .startOf("isoWeek")
      .subtract(1, "w")
      .format(DATE_FORMAT);
    const prevEndDate = moment()
      .endOf("isoWeek")
      .subtract(1, "w")
      .subtract(2, "d")
      .format(DATE_FORMAT);
    const prevDateStr = `${prevStartDate}-${prevEndDate}`;

    const CUSTOM_STR = "自定义";

    const dateOptions = [dateStr, prevDateStr, CUSTOM_STR];

    // 显示选择框并获取 jira issue
    let date =
      (await vscode.window.showQuickPick(dateOptions, {
        placeHolder: `选择要生成周报的周期，默认为 ${dateStr}`,
      })) || dateStr;

    if (date === CUSTOM_STR) {
      date =
        (await vscode.window.showInputBox({
          value: dateStr,
          placeHolder: `请输入 ${DATE_FORMAT}-${DATE_FORMAT} 格式的日期`,
          validateInput: (value) => {
            // 校验输入内容是否符合日期格式
            if (!/^\d{4}\/\d{2}\/\d{2}-\d{4}\/\d{2}\/\d{2}$/.test(value)) {
              return `请输入 ${DATE_FORMAT}-${DATE_FORMAT} 格式的日期`;
            }
            return null;
          },
        })) || "";
    }

    if (!date) {
      return;
    }

    showMessage("正在生成周报");

    const { issues, currentUser } = await fetchJiraIssues(date);

    const rows = issues.issues?.map((issue) => ({
      title: issue.fields.summary,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee.displayName,
      isAssist: currentUser.key !== issue.fields.assignee.key,
      type: issue.fields.issuetype.name,
      fixVersions: issue.fields.fixVersions?.[0]?.name,
      key: issue.key,
    }));

    // 获取桌面路径
    const desktopPath = path.join(os.homedir(), "Desktop");

    // 输出文件路径
    const outputPath = path.join(
      desktopPath,
      date.replace(/\//g, "-") + "周报.xlsx"
    );

    await generateExcel(rows || [], outputPath);

    showMessage(`生成周报成功：${outputPath}`);
  } catch (error) {
    showMessage(String(error), "error");
  }
};

async function fetchJiraIssues(dateStr: string) {
  let [startDate, endDate] = dateStr.split("-");
  endDate = moment(endDate, DATE_FORMAT).add(1, "d").format(DATE_FORMAT);

  const statusInProgressJQL =
    'status in (Doing, "Code Review", Testing, "Ready For Release", 修复中, "In Review", 调查中, 开发中, 问题调研, 测试验证中, 前后端联调, 测试中, 开发-Ready, 调研中)';

  const jqlArray = [];
  /**
   * 查找当前分配给或之前分配给 当前用户 的问题，状态不为 待解决 的问题
   */
  // 待解决的状态
  const notStarted =
    '未处理, 待解决, 需求待处理, "To Do", 待产品方案, 待产品确认, 待修复, Later, 待处理, 待开发, 待办, 需求待确认';

  jqlArray.push(`assignee WAS currentUser() AND status NOT IN (${notStarted})`);

  /**
   * 更新时间 / 创建时间 是时间范围内
   */
  jqlArray.push(
    `(updated >= "${startDate}" AND updated < "${endDate}") OR (created >= "${startDate}" AND created < "${endDate}")`
  );

  /**
   * 过滤解决时间在此时间范围之前的问题
   */
  jqlArray.push(`resolved >= "${startDate}" OR resolved IS null`);

  const jql = jqlArray.map((j) => `(${j})`).join(" AND ");

  /**
   * 查到分配给当前用户，状态为进行中的问题
   */
  const otherJql = `assignee = currentUser() AND ${statusInProgressJQL} AND created < "${endDate}" AND resolution = Unresolved`;

  /**
   * 根据优先级和创建时间进行排序
   */
  const sortJql = "ORDER BY priority, created DESC";

  const [issues, currentUser] = await Promise.all([
    jira.issueSearch.searchForIssuesUsingJqlPost({
      jql: `(${jql}) OR (${otherJql}) ${sortJql}`,
    }),
    jira.myself.getCurrentUser(),
  ]);

  return { issues, currentUser };
}

async function generateExcel(
  data: {
    key: string;
    title: string;
    status?: string;
    fixVersions?: string;
    type?: string;
    assignee?: string;
    isAssist: boolean;
  }[],
  outputPath: string
) {
  // 创建一个新的工作簿
  const workbook = new exceljs.Workbook();

  // 创建一个工作表
  const worksheet = workbook.addWorksheet("个人周报");

  worksheet.addTable({
    name: "weeklyReport",
    ref: "A1",
    headerRow: true,
    style: {
      theme: "TableStyleLight15",
    },
    columns: [
      { name: "Jira" },
      { name: "标题" },
      { name: "进度" },
      { name: "类型" },
      { name: "上线时间" },
      { name: "备注" },
    ],
    rows: data.map((row) => [
      row.key,
      row.title,
      row.status,
      row.type,
      row.fixVersions,
      row.isAssist ? `协助调查，流转给: ${row.assignee}` : "",
    ]),
  });

  await workbook.xlsx.writeFile(outputPath);
}
