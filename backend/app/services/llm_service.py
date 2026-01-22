"""
大模型服务模块
集成通义千问3-VL多模态大模型
"""
from openai import OpenAI
from typing import Optional, AsyncGenerator
import logging

from app.config.credentials import credentials_config

logger = logging.getLogger(__name__)


class QwenVLClient:
    """通义千问3-VL多模态大模型客户端"""

    def __init__(self):
        """初始化客户端"""
        self.client = OpenAI(
            base_url='https://api-inference.modelscope.cn/v1',
            api_key=credentials_config.get_modelscope_api_key()
        )
        self.model = 'Qwen/Qwen3-VL-235B-A22B-Instruct'
        logger.info("QwenVL客户端初始化完成")

    def chat_with_image(
        self,
        text: str,
        image_url: Optional[str] = None,
        stream: bool = True
    ):
        """
        多模态对话

        Args:
            text: 输入文本
            image_url: 图片URL（可选）
            stream: 是否使用流式输出

        Returns:
            响应结果
        """
        content = [{'type': 'text', 'text': text}]

        if image_url:
            content.append({
                'type': 'image_url',
                'image_url': {'url': image_url}
            })

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': content}],
                stream=stream
            )

            if stream:
                return response
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"LLM调用失败: {e}")
            raise

    async def chat_stream_async(
        self,
        text: str,
        image_url: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        异步流式对话

        Args:
            text: 输入文本
            image_url: 图片URL（可选）

        Yields:
            响应文本片段
        """
        content = [{'type': 'text', 'text': text}]

        if image_url:
            content.append({
                'type': 'image_url',
                'image_url': {'url': image_url}
            })

        try:
            logger.info(f"[LLM] 开始流式调用: {text[:50]}...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': content}],
                stream=True
            )

            chunk_count = 0
            for chunk in response:
                if chunk.choices:
                    delta_content = chunk.choices[0].delta.content
                    if delta_content:
                        chunk_count += 1
                        logger.debug(f"[LLM] 发送chunk #{chunk_count}: '{delta_content}'")
                        yield delta_content

            logger.info(f"[LLM] 流式调用完成，共发送{chunk_count}个chunk")

        except Exception as e:
            logger.error(f"LLM流式调用失败: {e}")
            raise


# 创建全局实例
qwen_client = QwenVLClient()
