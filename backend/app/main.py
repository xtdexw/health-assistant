"""
健康咨询助手后端主应用
FastAPI应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api import chat
from app.api import debug
from app.api import test_vector
from app.config.credentials import credentials_config

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="健康咨询助手API",
    description="企业级AI健康咨询数字员工后端服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router)
app.include_router(debug.router)
app.include_router(test_vector.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "健康咨询助手API",
        "version": "1.0.0",
        "status": "running",
        "credentials": credentials_config.validate_credentials()
    }


@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "services": {
            "llm": credentials_config.get_modelscope_api_key() is not None,
        }
    }


@app.get("/test/api-key")
async def test_api_key():
    """测试API密钥加载"""
    api_key = credentials_config.get_modelscope_api_key()
    return {
        "api_key_loaded": bool(api_key),
        "api_key_preview": f"{api_key[:20]}..." if api_key else None,
        "api_key_length": len(api_key) if api_key else 0
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局异常处理"""
    logger.error(f"未处理的异常: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
