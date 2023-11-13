# Easier

## 一键创建分支和生成 Merge Request

**使用方法：**

1. 按键：shift + command + p
2. 输入 Create branch and merge request
3. 按键：enter
4. 从 jira 列表中选择需求
5. 选择从哪个分支切出新分支进行开发

**使用该指令需要进行以下配置**

| 配置项                                        | 描述                | 默认值 | 必填 |
| :-------------------------------------------- | :------------------ | :----- | :--- |
| Easier.settings.jiraHost                      | jira 地址           | -      | 是   |
| Easier.settings.gitlabHost                    | gitlab 地址         | -      | 是   |
| Easier.settings.jiraUserPersonalAccessToken   | jira 个人访问令牌   | -      | 是   |
| Easier.settings.gitlabUserPersonalAccessToken | gitlab 个人访问令牌 |        | 是   |

**如何拿到 jira 个人访问令牌**

1. 用户中心 -> 用户信息
2. 个人访问令牌 -> 创建令牌

**如何拿到 gitlab 个人访问令牌**

1. 用户中心 -> Preferences
2. Access Tokens -> 填写信息 -> 创建 Token

## 根据 Jira 任务一键生成个人周报

**使用方法：**

1. 按键：shift + command + p
2. 输入 Generate weekly report
3. 按键：enter
4. 选择 / 自定义输入日期范围
5. 按键：enter

**使用该指令需要进行以下配置**

| 配置项                                      | 描述              | 默认值 | 必填 |
| :------------------------------------------ | :---------------- | :----- | :--- |
| Easier.settings.jiraHost                    | jira 地址         | -      | 是   |
| Easier.settings.jiraUserPersonalAccessToken | jira 个人访问令牌 | -      | 是   |

**如何拿到 jira 个人访问令牌**

1. 用户中心 -> 用户信息
2. 个人访问令牌 -> 创建令牌

## 根据 .txt 文件更新 .csv 翻译文件

**使用方法：**

1. 按键：shift + command + p
2. 输入 Update csv file
