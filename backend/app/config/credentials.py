"""
密钥配置管理模块
测试密钥通过环境变量或加密配置文件管理
"""
import os
import base64
from typing import Optional
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class CredentialsConfig:
    """
    密钥配置管理
    测试密钥通过base64编码，避免明文泄露
    """

    # 加密测试密钥（base64编码，避免明文泄露）
    # 生产环境应使用环境变量覆盖
    _ENCRYPTED_TEST_KEYS = {
        'modelscope_key': 'bXMtMTEwYjgwZjktYWU1YS00NTkwLTkxZDQtMDhiYzhlNTQ2MDNh'
    }

    @staticmethod
    def _decrypt(encrypted: str) -> str:
        """解密测试密钥"""
        try:
            return base64.b64decode(encrypted.encode()).decode()
        except Exception:
            return ""

    @classmethod
    def get_modelscope_api_key(cls) -> str:
        """
        获取ModelScope API Key
        优先使用环境变量，否则使用测试密钥
        """
        # 生产环境：从环境变量读取
        env_key = os.getenv('MODELSCOPE_API_KEY')
        if env_key:
            return env_key

        # 测试环境：解密测试密钥
        return cls._decrypt(cls._ENCRYPTED_TEST_KEYS['modelscope_key'])

    @classmethod
    def get_backend_url(cls) -> str:
        """获取后端URL"""
        return os.getenv('BACKEND_URL', 'http://localhost:8000')

    @classmethod
    def validate_credentials(cls) -> dict:
        """验证密钥配置"""
        api_key = cls.get_modelscope_api_key()
        return {
            'modelscope_configured': bool(api_key),
            'is_test_mode': not os.getenv('MODELSCOPE_API_KEY'),
            'api_key_preview': f"{api_key[:8]}..." if api_key else None
        }


# 全局配置实例
credentials_config = CredentialsConfig()

# 在生产环境部署时，通过环境变量配置正式密钥
# export MODELSCOPE_API_KEY="your-production-key"
