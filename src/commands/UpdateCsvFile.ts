import { showMessage } from "../utils/common";
import { readFile } from "node:fs/promises";
import * as vscode from "vscode";

const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const gap = "║";

// 以下是一个可以用 Node.js 读写 CSV 文件的脚本示例：
// 在这个脚本中，我们使用了 Node.js 内置的文件系统模块   fs   ，以及第三方的 CSV 文件解析库   csv-parser   。
// 在   readCSV    函数中，我们使用了   fs.createReadStream    和   csv    模块的   pipe    方法来读取 CSV 文件，
// 将数据逐行解析，并将每一行数据存储到一个数组中。读取完成后，函数返回该数组。
// 在   writeCSV    函数中，我们使用了   fs.writeFile    方法来将处理过的数据写入 CSV 文件。
// 我们将数据转换为一个二维数组，其中每个内层数组代表了一行数据。然后将其连接成一个字符串，并写入文件。
export const updateCsvFile = async () => {
  try {
    const rootDir = vscode.workspace.workspaceFolders?.[0].uri.path || "";

    const translateData = await readFile(
      path.join(rootDir, "mage-i18n/translate.txt"),
      {
        encoding: "utf8",
      }
    );

    // 定义需要写入文件的数据
    // 将数据转换为JSON格式
    const data = translateData.split("\n").map((item) => item.split("\t"));

    const translateMap: Record<string, string> = {};

    data.forEach((item) => {
      translateMap[item[0].trim()] = item[1];
    });

    const csvData = await readCSV(
      path.join(
        vscode.workspace.workspaceFolders?.[0].uri.path || "",
        "mage-i18n/messages.csv"
      )
    );

    let result = [];
    for (const item of csvData) {
      result.push(Object.values(item).join());
    }

    // 为了正确处理数据，不然只能读取部分行，原因未知
    result = result
      .join("\n")
      .split("\n")
      .map((item) => item.split(gap));

    result = result.map((item) => {
      if (translateMap[item[1].trim()]) {
        item.splice(2, 1, translateMap[item[1].trim()].trim());
        return item;
      }
      return item;
    });

    await writeCSV(path.join(rootDir, "mage-i18n/messages.csv"), result);

    showMessage("更新成功");
  } catch (error) {
    showMessage(String(error), "error");
  }
};

// 读取 CSV 文件
function readCSV(filePath: string) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    const data: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: Record<string, string>) => {
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      })
      .on("error", (error: Error) => {
        reject(error);
      });
  });
}

// 写入 CSV 文件
function writeCSV(filePath: string, data: string[][]) {
  return new Promise((resolve, reject) => {
    const rows = [];
    for (const item of data) {
      rows.push(item.join(gap));
    }
    const csvData = rows.join("\n");
    fs.writeFile(filePath, csvData, (error: Error) => {
      if (error) {
        reject(error);
      } else {
        resolve("");
      }
    });
  });
}
