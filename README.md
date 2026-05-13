# BBT Lamp System

慈行寺光明灯申请系统，第一版包含三个界面：

1. 光明灯介绍与项目选择
2. 填写点灯资料与确认申请
3. 申请成功通知与缴费说明

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

如果本地暂时没有配置 `MONGODB_URI`，后端会自动使用内存储存模式，方便前期先测试 API 和完整页面流程。

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

## API

```http
GET /api/health
GET /api/lamp-options
POST /api/applications
```

申请编号格式：

```text
BBT + YYYYMMDD + 项目代码 + 三位流水号
```

例如：

```text
BBT20260506PP001
```
