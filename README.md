# BBT Lamp System

慈行寺光明灯申请系统，目前第一阶段已经完成本地前后端架构、申请流程、动态资料表单、本地存档和点灯记录查询。

## Current Features

系统目前包含四个主要界面：

1. 光明灯介绍与项目选择
2. 填写点灯资料与确认申请
3. 申请成功通知与缴费说明
4. 用户登录查询点灯记录

已实现功能：

- 介绍页使用平安光明灯、财富光明灯实景图片展示。
- 用户可选择平安光明灯或财富光明灯，再选择具体项目。
- 点击项目弹窗外部区域可关闭弹窗。
- 填写资料页面会根据所选灯种和项目动态显示字段。
- 邮箱必填，手机号选填。
- 点灯申请提交后会生成申请编号。
- 没有 MongoDB 时，申请记录会保存到本地 JSON 文件。
- 用户可通过申请编号和登记邮箱/手机号查询点灯记录。

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

如果本地暂时没有配置 `MONGODB_URI`，后端会自动使用本地 JSON 存档，方便前期测试完整页面流程。

本地存档文件：

```text
server/storage/applications.json
```

该文件会自动生成，已加入 `.gitignore`，不会提交真实申请资料。

## Local Setup

```bash
npm install
```

复制后端环境变量：

```bash
cp server/.env.example server/.env
```

启动后端：

```bash
npm run dev:server
```

启动前端：

```bash
npm run dev:client
```

也可以在根目录一次启动前后端：

```bash
npm run dev
```

默认地址：

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

如果用局域网地址打开前端，例如 `http://192.168.1.171:5173`，前端会自动请求同一台机器的 `:5001` API。后端默认允许 `localhost`、`127.0.0.1` 和常见局域网 IP origin，方便本地和手机测试。

## Application Flow

### 1. 介绍页面

用户先在介绍页选择：

- 平安光明灯
- 财富光明灯

页面底部显示当前选择，并提供：

- 立即点灯
- 已点灯，请登录查询

点击 `立即点灯` 后会打开项目弹窗。

### 2. 项目选择

平安光明灯项目：

- 个人
- 阖家

财富光明灯项目：

- 大功德主
- 公司
- 个人

选择项目后进入填写资料页面。

### 3. 动态资料表单

所有申请都会收集：

- 姓名，必填
- 法名，选填
- 生日，选填
- 地区，必填
- 电子邮箱，必填
- 手机号码，选填

根据项目额外收集：

- 平安光明灯-个人：点灯功德主姓名
- 平安光明灯-阖家：点灯功德主姓名、家人名单
- 财富光明灯-公司：公司名字
- 财富光明灯-大功德主：大功德主姓名
- 财富光明灯-个人：点灯功德主姓名

### 4. 登录查询

用户可以通过以下资料查询点灯记录：

- 申请编号
- 登记时使用的电子邮箱或手机号码

## API

```http
GET /
GET /api/health
GET /api/lamp-options
POST /api/applications
POST /api/applications/login
```

## Application Number Rule

申请编号格式：

```text
BBT + YYYYMMDD + 项目代码 + 三位年度流水号
```

项目代码：

- `PP`: 平安光明灯-个人
- `PF`: 平安光明灯-阖家
- `WG`: 财富光明灯-大功德主
- `WC`: 财富光明灯-公司
- `WP`: 财富光明灯-个人

流水号规则：

- 平安灯相关项目共用一组年度流水号。
- 财富灯相关项目共用另一组年度流水号。
- 两组互不混用。
- 流水号以一年为周期累计。

示例：

```text
第一盏个人平安灯：BBT20260506PP001
第二盏阖家平安灯：BBT20260506PF002

第一盏公司财富灯：BBT20260506WC001
第二盏大功德主财富灯：BBT20260506WG002
第三盏个人财富灯：BBT20260506WP003
```

## Useful Commands

查看 5001 是否被占用：

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

停止占用进程：

```bash
kill <PID>
```

构建前端：

```bash
npm run build
```
