"""
聊天API接口
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import logging
import json
import base64

from app.services.dialogue_service import dialogue_manager
from app.services.knowledge_base_service import knowledge_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])

# 启动时加载知识库
try:
    knowledge_base = knowledge_service.load_all_knowledge()
    logger.info(f"知识库加载成功，共{len(knowledge_base)}条知识")
except Exception as e:
    logger.error(f"知识库加载失败: {e}")
    knowledge_base = []


class ChatRequest(BaseModel):
    """聊天请求模型"""
    message: str
    image_url: Optional[str] = None


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    聊天对话接口（带向量检索）

    Args:
        request: 聊天请求

    Returns:
        聊天响应
    """
    try:
        logger.info(f"收到聊天请求: message='{request.message}', image_url={request.image_url}")

        if not request.message or not request.message.strip():
            logger.warning("消息内容为空")
            raise HTTPException(status_code=400, detail="消息内容不能为空")

        logger.info("开始处理对话...")
        result = await dialogue_manager.process_user_input(
            user_input=request.message,
            image_url=request.image_url,
            knowledge_base=knowledge_base
        )

        logger.info(f"对话处理完成, intent={result.get('intent')}")

        response_data = {
            "response": result['text_response'],
            "widget": result.get('widget_data'),
            "intent": result.get('intent', 'unknown'),
            "state": "speak",
            "vector_search": result.get('vector_search')
        }

        logger.info(f"返回响应给前端, response长度={len(response_data['response'])}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"聊天处理失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    """
    食物图片分析接口（带向量检索）
    
    Args:
        file: 上传的图片文件
        
    Returns:
        分析结果
    """
    try:
        # 读取图片文件并转换为base64
        image_data = await file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        image_url = f"data:{file.content_type};base64,{base64_image}"
        
        # 使用dialogue_manager处理图片分析，传入知识库
        result = await dialogue_manager.process_user_input(
            user_input="请分析这张图片中的食物，提供营养成分分析和健康建议",
            image_url=image_url,
            knowledge_base=knowledge_base
        )
        
        return {
            "analysis": result['text_response'],
            "recommendations": result.get('widget_data'),
            "vector_search": result.get('vector_search')
        }
        
    except Exception as e:
        logger.error(f"图片分析失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge/stats")
async def get_knowledge_stats():
    """
    获取知识库统计信息

    Returns:
        知识库统计
    """
    try:
        stats = {
            "total": len(knowledge_base),
            "categories": {}
        }

        for item in knowledge_base:
            category = item.get('category', 'unknown')
            if category not in stats['categories']:
                stats['categories'][category] = 0
            stats['categories'][category] += 1

        return stats

    except Exception as e:
        logger.error(f"获取知识库统计失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def stream_generator(user_input: str, image_url: Optional[str] = None):
    """
    流式响应生成器

    Args:
        user_input: 用户输入
        image_url: 图片URL（可选）

    Yields:
        SSE格式的流式数据
    """
    try:
        async for data in dialogue_manager.process_user_input_stream(
            user_input=user_input,
            image_url=image_url,
            knowledge_base=knowledge_base
        ):
            # 使用SSE格式发送数据
            yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

        # 发送结束标记
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"流式生成失败: {e}")
        yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    聊天对话接口（流式输出）

    Args:
        request: 聊天请求

    Returns:
        流式响应
    """
    try:
        logger.info(f"收到流式聊天请求: message='{request.message}', image_url={request.image_url}")

        if not request.message or not request.message.strip():
            logger.warning("消息内容为空")
            raise HTTPException(status_code=400, detail="消息内容不能为空")

        return StreamingResponse(
            stream_generator(request.message, request.image_url),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"流式聊天处理失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
