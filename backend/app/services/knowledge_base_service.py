"""
知识库加载服务
负责加载和管理医疗健康知识库
"""
import json
import logging
from pathlib import Path
from typing import List, Dict

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """知识库服务"""

    def __init__(self, base_path: str = None):
        """
        初始化知识库服务
        
        Args:
            base_path: 知识库基础路径
        """
        if base_path is None:
            # 默认使用 backend/knowledge_base 目录
            current_file = Path(__file__)
            base_path = current_file.parent.parent.parent / "knowledge_base"
        
        self.base_path = Path(base_path)
        self.knowledge_cache = {}
        logger.info(f"知识库服务初始化，基础路径: {self.base_path}")

    def load_all_knowledge(self) -> List[Dict]:
        """
        加载所有知识库
        
        Returns:
            知识库列表
        """
        all_knowledge = []

        try:
            # 定义知识库类别和对应文件
            knowledge_files = {
                'nutrition': self.base_path / "nutrition" / "knowledge.json",
                'fitness': self.base_path / "fitness" / "knowledge.json",
                'sub_health': self.base_path / "sub_health" / "knowledge.json",
                'general': self.base_path / "general" / "knowledge.json"
            }

            for category, file_path in knowledge_files.items():
                if file_path.exists():
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            # 为每条知识添加类别标记
                            for item in data:
                                item['category'] = category
                            all_knowledge.extend(data)
                            logger.info(f"加载{category}知识库: {len(data)}条")
                    except Exception as e:
                        logger.error(f"加载{category}知识库失败: {e}")
                else:
                    logger.warning(f"知识库文件不存在: {file_path}")

            logger.info(f"知识库加载完成，共{len(all_knowledge)}条")
            return all_knowledge

        except Exception as e:
            logger.error(f"加载知识库失败: {e}")
            return []

    def get_knowledge_by_category(self, category: str) -> List[Dict]:
        """
        获取特定类别的知识
        
        Args:
            category: 类别名称
            
        Returns:
            该类别的知识列表
        """
        if category in self.knowledge_cache:
            return self.knowledge_cache[category]

        try:
            file_path = self.base_path / category / "knowledge.json"
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.knowledge_cache[category] = data
                    return data
        except Exception as e:
            logger.error(f"加载{category}知识库失败: {e}")
        
        return []

    def search_knowledge(self, keyword: str) -> List[Dict]:
        """
        搜索包含关键词的知识
        
        Args:
            keyword: 关键词
            
        Returns:
            匹配的知识列表
        """
        all_knowledge = self.load_all_knowledge()
        results = []

        keyword_lower = keyword.lower()
        for item in all_knowledge:
            # 在content和keywords中搜索
            content = item.get('content', '').lower()
            keywords = ' '.join(item.get('keywords', [])).lower()
            
            if keyword_lower in content or keyword_lower in keywords:
                results.append(item)

        logger.info(f"搜索'{keyword}'找到{len(results)}条结果")
        return results

    def format_knowledge_for_context(self, knowledge_items: List[Dict]) -> List[str]:
        """
        将知识项格式化为上下文文本
        
        Args:
            knowledge_items: 知识项列表
            
        Returns:
            格式化后的文本列表
        """
        return [item['content'] for item in knowledge_items]


# 创建全局实例
knowledge_service = KnowledgeBaseService()
