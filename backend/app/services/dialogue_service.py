"""
对话管理服务模块
负责对话流程控制和响应生成
"""
import logging
from typing import Dict, List, Optional
from enum import Enum

from app.services.llm_service import qwen_client
from app.services.vector_service import vector_retriever

logger = logging.getLogger(__name__)


class ConversationIntent(Enum):
    """对话意图类型"""
    NUTRITION = "nutrition"  # 营养膳食
    FITNESS = "fitness"  # 健身计划
    SUB_HEALTH = "sub_health"  # 亚健康调理
    HEALTH_KNOWLEDGE = "health_knowledge"  # 健康知识
    CHITCHAT = "chitchat"  # 闲聊


class DialogueManager:
    """对话管理器"""

    def __init__(self):
        """初始化对话管理器"""
        self.llm = qwen_client
        self.retriever = vector_retriever
        self.state = {
            'intent': None,
            'context': {},
            'turn_count': 0,
            'user_profile': {}
        }
        logger.info("对话管理器初始化完成")

    async def process_user_input(
        self,
        user_input: str,
        image_url: Optional[str] = None,
        knowledge_base: Optional[List[Dict]] = None
    ) -> Dict:
        """
        处理用户输入

        Args:
            user_input: 用户输入文本
            image_url: 图片URL（可选）
            knowledge_base: 知识库（可选）

        Returns:
            响应结果 {text_response, widget_data, intent, vector_search}
        """
        try:
            # 1. 意图识别
            intent = await self._classify_intent(user_input)
            logger.info(f"识别意图: {intent.value}")

            # 2. 知识检索
            relevant_docs = []
            vector_search_info = None
            if knowledge_base:
                matches = self.retriever.get_top_k_matches(
                    user_input,
                    knowledge_base,
                    top_k=3
                )

                # 相似度阈值：只有当最高相似度达到40%以上时才启用向量检索
                # 这样可以避免完全不相关的问题也返回低质量的匹配结果
                SIMILARITY_THRESHOLD = 0.40
                max_score = max([m.get('score', 0) for m in matches]) if matches else 0

                if max_score >= SIMILARITY_THRESHOLD:
                    # 相似度足够高，使用向量检索结果
                    relevant_docs = [m['content'] for m in matches]

                    # 构建向量检索信息，用于前端展示
                    vector_search_info = {
                        'enabled': True,
                        'total_knowledge': len(knowledge_base),
                        'retrieved_count': len(matches),
                        'top_matches': [
                            {
                                'content': m['content'][:100] + '...' if len(m['content']) > 100 else m['content'],
                                'category': m.get('category', 'unknown'),
                                'score': round(m.get('score', 0), 4)
                            }
                            for m in matches
                        ]
                    }
                    logger.info(f"向量检索启用：检索到{len(relevant_docs)}条相关知识，最高相似度: {max_score:.2%}")
                else:
                    # 相似度太低，不启用向量检索
                    logger.info(f"向量检索未启用：最高相似度{max_score:.2%}低于阈值{SIMILARITY_THRESHOLD:.2%}，判定为不相关问题")

            # 3. 构建prompt
            prompt = self._build_prompt(user_input, relevant_docs, intent, image_url is not None)

            # 4. 生成回复
            if image_url:
                # 多模态对话
                response_text = ""
                async for chunk in self.llm.chat_stream_async(prompt, image_url):
                    response_text += chunk
            else:
                # 纯文本对话
                response = self.llm.chat_with_image(prompt, None, stream=False)
                response_text = response

            # 5. 提取widget指令
            widget_data = self._extract_widget_commands(response_text)

            # 6. 更新状态
            self.state['intent'] = intent
            self.state['turn_count'] += 1

            return {
                'text_response': response_text,
                'widget_data': widget_data,
                'intent': intent.value,
                'vector_search': vector_search_info
            }

        except Exception as e:
            logger.error(f"处理用户输入失败: {e}")
            return {
                'text_response': "抱歉，处理您的请求时出现了错误。请稍后再试。",
                'widget_data': None,
                'intent': 'error',
                'vector_search': None
            }

    async def _classify_intent(self, user_input: str) -> ConversationIntent:
        """识别用户意图"""
        # 简单的关键词匹配意图识别
        keywords = {
            ConversationIntent.NUTRITION: ['吃', '食物', '营养', '饮食', '餐', '膳食', '健康食谱'],
            ConversationIntent.FITNESS: ['运动', '健身', '锻炼', '减肥', '增肌', '训练', '体育'],
            ConversationIntent.SUB_HEALTH: ['疲劳', '失眠', '睡眠', '亚健康', '调理', '不舒服', '症状'],
        }

        user_input_lower = user_input.lower()
        for intent, words in keywords.items():
            if any(word in user_input_lower for word in words):
                return intent

        return ConversationIntent.HEALTH_KNOWLEDGE

    def _build_prompt(
        self,
        user_input: str,
        relevant_docs: List[str],
        intent: ConversationIntent,
        has_image: bool
    ) -> str:
        """构建系统prompt"""
        system_prompt = f"""你是企业健康咨询助手"小星"，负责为员工提供专业的健康咨询服务。

你的服务范围：
1. 营养膳食建议 - 分析食物营养成分，推荐健康饮食方案
2. 健身计划指导 - 根据身体状况制定运动计划
3. 亚健康调理咨询 - 提供专业的亚健康状态调理建议
4. 健康知识普及 - 解答各种健康相关问题

回答要求：
- 专业、友善、实用
- 基于科学依据，避免提供不实信息
- 如果不确定，建议咨询专业医生
- 回答简洁明了，避免过于冗长
"""

        # 添加相关知识库内容
        if relevant_docs:
            system_prompt += f"\n相关知识库内容：\n{chr(10).join(relevant_docs)}\n"

        # 添加提示
        if has_image:
            system_prompt += "\n注意：用户上传了一张图片，请结合图片内容回答。"

        system_prompt += f"\n用户问题：{user_input}\n\n请提供专业建议："

        return system_prompt

    def _extract_widget_commands(self, response: str) -> Optional[Dict]:
        """从响应中提取widget指令"""
        # 简单实现：检查是否包含特定标记
        # 实际可以更复杂，解析JSON格式的指令
        if '[卡片]' in response or '[展示]' in response:
            return {
                'type': 'widget_pic',
                'content': {
                    'title': '健康建议',
                    'content': response
                }
            }
        return None

    def reset_state(self):
        """重置对话状态"""
        self.state = {
            'intent': None,
            'context': {},
            'turn_count': 0,
            'user_profile': {}
        }
        logger.info("对话状态已重置")


# 创建全局实例
dialogue_manager = DialogueManager()
