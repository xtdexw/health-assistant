"""
聊天API接口
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import logging
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
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="消息内容不能为空")


        result = await dialogue_manager.process_user_input(
            user_input=request.message,
            image_url=request.image_url,
            knowledge_base=knowledge_base
        )

        
        response_data = {
            "response": result['text_response'],
            "widget": result.get('widget_data'),
            "intent": result.get('intent', 'unknown'),
            "state": "speak",
            "vector_search": result.get('vector_search')
        }
        
        
        return response_data

    except Exception as e:
        logger.error(f"聊天处理失败: {e}")
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
