# AI健康咨询数字员工 - 健康咨询小星

> 企业级AI健康咨询数字员工 - 您的7×24小时健康管家

## 项目简介

本项目是一个企业级AI健康咨询数字员工应用，定位为企业健康咨询助手，提供营养膳食建议、健身计划指导、亚健康调理咨询及健康知识普及服务。

### 核心特性

- 🏥 **专业健康咨询** - 基于通义千问3-VL多模态大模型，提供科学可靠的健康建议
- 🤖 **3D数字人交互** - 使用魔珐星云具身驱动SDK，实现自然的多模态交互
- 🖼️ **图片识别分析** - 支持食物图片分析，提供营养成分评估
- 🔍 **智能向量检索** - 使用Qwen3-Embedding-8B实现语义搜索，知识库60+条健康知识
- 🎯 **相似度阈值过滤** - 40%相似度阈值，避免低质量匹配
- 📊 **可视化检索结果** - 向量检索徽章展示知识库使用情况

### 技术栈

**前端**
- React 18.2.0 - UI框架
- 魔珐星云具身驱动SDK - 数字人驱动
- Axios 1.6.2 - HTTP客户端
- Tailwind CSS 3.3.6 - CSS框架

**后端**
- FastAPI 0.104.1 - Web框架
- 通义千问3-VL-235B-A22B-Instruct - 多模态大模型
- Qwen3-Embedding-8B - 向量嵌入模型（4096维）

---

## 快速开始

### 前置要求

- Node.js 16+
- Python 3.9+
- 魔珐星云账号
- ModelScope账号

### 1. 安装依赖

**前端**
```bash
cd frontend
npm install
```

**后端**
```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

**使用启动脚本（推荐）**
```bash
start.bat
```

**或手动启动**

启动后端：
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

启动前端：
```bash
cd frontend
npm start
```

### 3. 配置密钥

访问 http://localhost:3000

**使用配置界面**：
1. 点击右上角 ⚙️ 设置按钮
2. 填写密钥信息
3. 点击"保存密钥"

### 4. 连接数字人

1. 刷新页面（按F5）
2. 点击 **"连接"** 按钮
3. 等待数字人初始化
4. 开始健康咨询对话

---

## 核心功能

### 向量检索系统

- **知识库**: 4个分类，60+条健康知识
- **模型**: Qwen3-Embedding-8B（4096维向量）
- **检索**: 余弦相似度 + Top-K（K=3）
- **阈值**: 40%相似度过滤

### 数字人状态机

```
offline → connecting → idle → listen → think → speak
```

### API端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/chat` | POST | 聊天对话 |
| `/api/analyze-food` | POST | 食物图片分析 |
| `/api/knowledge/stats` | GET | 知识库统计 |
| `/health` | GET | 健康检查 |

---

## 技术亮点

1. 多模态AI（Qwen3-VL）
2. 向量语义检索
3. 智能阈值过滤
4. 知识库可视化
5. 状态机管理

---

## 项目结构

```
health-assistant/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── services/        # 服务层
│   │   └── styles/          # 样式文件
│   └── package.json
│
├── backend/                  # FastAPI后端
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── services/       # 业务逻辑
│   │   └── config/         # 配置管理
│   ├── knowledge_base/     # 健康知识库
│   └── requirements.txt
│
├── README.md               # 项目说明（本文档）
└── CLAUDE.md               # 详细开发文档
```

---

## 密钥配置说明

### 获取魔珐星云密钥
1. 访问 [https://xingyun3d.com/](https://xingyun3d.com/)
2. 注册并登录
3. 进入应用中心
4. 创建驱动应用，获取App ID和Secret

### 获取ModelScope密钥
1. 访问 [https://modelscope.cn/](https://modelscope.cn/)
2. 注册并登录
3. 进入个人中心
4. 生成API Token

---

## 文档

- **README.md** - 项目说明和快速启动（本文档）
- **CLAUDE.md** - 详细开发文档，包含技术架构、API文档、开发指南

---

**项目版本**: v1.0.0  
**最后更新**: 2026-01-08  
**文档版本**: v3.0
