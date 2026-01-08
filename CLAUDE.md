# 健康咨询小星 - 技术开发文档

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术架构](#2-技术架构)
- [3. 前端开发](#3-前端开发)
- [4. 后端开发](#4-后端开发)
- [5. 向量检索系统](#5-向量检索系统)
- [6. API文档](#6-api文档)
- [7. 开发指南](#7-开发指南)
- [8. 部署指南](#8-部署指南)
- [9. 故障排除](#9-故障排除)

---

## 1. 项目概述

### 1.1 项目定位

为企业提供7×24小时在线的健康咨询数字员工，专注于：
- 日常营养膳食建议
- 健身计划指导
- 亚健康调理咨询
- 健康知识普及

### 1.2 技术选型理由

| 技术 | 选型理由 |
|------|---------|
| React | 成熟的前端框架，生态丰富 |
| 魔珐星云SDK | 提供专业的3D数字人驱动能力 |
| FastAPI | 现代Python Web框架，性能优秀 |
| Qwen3-VL | 多模态大模型，支持图文理解 |
| Qwen3-Embedding-8B | 中文语义理解优秀，向量效果好 |

---

## 2. 技术架构

### 2.1 系统架构图

```
用户界面层 → 魔珐SDK层 → 业务逻辑层 → AI模型层 → 数据层
```

### 2.2 数据流转

用户输入 → API → 意图识别 → 向量检索 → Prompt构建 → LLM生成 → 返回结果

---

## 3. 前端开发

### 3.1 核心组件

#### App.jsx
全局状态管理、SDK生命周期管理

#### ChatPanel.jsx
消息列表、输入处理、图片上传

#### VectorSearchBadge.jsx
显示向量检索结果

### 3.2 服务层

#### avatarService.js
SDK封装：初始化、连接、状态控制

#### chatService.js
API服务：发送消息、图片分析

#### credentialService.js
密钥管理：存储、读取、验证

---

## 4. 后端开发

### 4.1 核心服务

#### llm_service.py
QwenVL客户端，多模态对话

#### vector_service.py
向量检索服务，Qwen3-Embedding-8B

#### dialogue_service.py
对话管理器，意图识别、上下文管理

#### knowledge_base_service.py
知识库加载和管理

### 4.2 API路由

chat.py提供：
- POST /api/chat - 聊天对话
- POST /api/analyze-food - 图片分析
- GET /api/knowledge/stats - 知识库统计

---

## 5. 向量检索系统

### 5.1 知识库结构

4个分类，60+条健康知识：
- 营养膳食 15条
- 健身计划 15条
- 亚健康调理 15条
- 通用知识 15条

### 5.2 检索流程

问题向量化 → 相似度计算 → 排序 → 阈值过滤(40%) → Top-K(3)

### 5.3 相似度计算

使用余弦相似度：cos(θ) = (A·B) / (||A|| × ||B||)

---

## 6. API文档

### 6.1 POST /api/chat

请求：
```json
{"message": "问题", "image_url": "可选"}
```

响应：
```json
{
  "response": "回复",
  "intent": "nutrition",
  "vector_search": {...}
}
```

### 6.2 POST /api/analyze-food

上传食物图片，返回分析结果

---

## 7. 开发指南

### 7.1 环境搭建

前端：npm install && npm start
后端：pip install -r requirements.txt && uvicorn app.main:app

### 7.2 添加知识

编辑knowledge_base中的JSON文件

---

## 8. 部署指南

### 8.1 前端部署

npm run build，部署build目录

### 8.2 后端部署

使用Gunicorn或Docker部署

---

## 9. 故障排除

SDK未加载 → 检查网络、清除缓存
连接失败 → 验证密钥、检查后端
向量检索失败 → 检查API Key、知识库

---

**文档版本**: v3.0  
**最后更新**: 2026-01-08
