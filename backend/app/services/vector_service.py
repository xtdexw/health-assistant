"""
向量检索服务模块
使用Qwen3-Embedding-8B向量化模型
"""
import numpy as np
from typing import List, Dict
from openai import OpenAI
import logging

from app.config.credentials import credentials_config

logger = logging.getLogger(__name__)


def cosine_similarity(vec1, vec2):
    """计算余弦相似度"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2)


class MedicalVectorRetriever:
    """医疗向量检索服务"""

    def __init__(self):
        """初始化向量检索服务"""
        self.client = OpenAI(
            base_url='https://api-inference.modelscope.cn/v1',
            api_key=credentials_config.get_modelscope_api_key()
        )
        self.model = 'Qwen/Qwen3-Embedding-8B'
        self.embedding_cache = {}  # 缓存已计算的向量
        logger.info("医疗向量检索服务初始化完成 (Qwen3-Embedding-8B)")

    def get_embedding(self, text: str) -> List[float]:
        """
        获取文本的向量表示

        Args:
            text: 输入文本

        Returns:
            向量表示（4096维）
        """
        # 检查缓存
        if text in self.embedding_cache:
            return self.embedding_cache[text]

        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text,
                encoding_format='float'
            )
            embedding = response.data[0].embedding

            # 缓存结果
            self.embedding_cache[text] = embedding
            return embedding

        except Exception as e:
            logger.error(f"获取向量失败: {e}")
            return [0.0] * 4096

    def query(
        self,
        source_sentence: str,
        sentences_to_compare: List[str]
    ) -> Dict:
        """
        查询最相似的健康知识

        Args:
            source_sentence: 源句子（用户问题）
            sentences_to_compare: 待比较的句子列表

        Returns:
            相似度查询结果
        """
        try:
            # 获取查询向量
            query_embedding = self.get_embedding(source_sentence)

            # 批量获取对比句子的向量
            compare_embeddings = [
                self.get_embedding(sent)
                for sent in sentences_to_compare
            ]

            # 计算余弦相似度
            scores = [
                cosine_similarity(query_embedding, emb)
                for emb in compare_embeddings
            ]

            logger.info(f"向量检索完成，查询: {source_sentence[:30]}...")
            return {"scores": scores}

        except Exception as e:
            logger.error(f"向量检索失败: {e}")
            return {"scores": [0.0] * len(sentences_to_compare)}

    def get_top_k_matches(
        self,
        query: str,
        knowledge_base: List[Dict],
        top_k: int = 3
    ) -> List[Dict]:
        """
        获取最匹配的K条知识

        Args:
            query: 用户查询
            knowledge_base: 知识库列表，每项包含 {content: str, metadata: dict}
            top_k: 返回前K个结果

        Returns:
            匹配的知识列表
        """
        if not knowledge_base:
            return []

        # 提取知识内容
        sentences = [item['content'] for item in knowledge_base]

        # 执行向量查询
        result = self.query(query, sentences)

        # 获取相似度分数
        scores = result.get('scores', [0.0] * len(sentences))

        # 组合结果
        scored_items = [
            {**item, 'score': score}
            for item, score in zip(knowledge_base, scores)
        ]

        # 按分数排序并返回前K个
        scored_items.sort(key=lambda x: x['score'], reverse=True)
        return scored_items[:top_k]


# 创建全局实例
vector_retriever = MedicalVectorRetriever()
