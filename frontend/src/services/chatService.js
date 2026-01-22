/**
 * 聊天API服务
 * 负责与后端AI服务进行通信
 */
import axios from 'axios';

// API基础URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// 创建axios实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60秒超时
});

// 请求拦截器 - 添加调试日志
apiClient.interceptors.request.use(
  (config) => {
    console.log('[ChatService] 发送请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('[ChatService] 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 添加调试日志
apiClient.interceptors.response.use(
  (response) => {
    console.log('[ChatService] 收到响应:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[ChatService] 响应拦截器错误:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

/**
 * 聊天服务类
 */
class ChatService {
  /**
   * 发送聊天消息
   * @param {string} message - 用户消息
   * @param {string} imageUrl - 图片URL（可选）
   * @returns {Promise} 聊天响应
   */
  async sendMessage(message, imageUrl = null) {
    try {
      const payload = {
        message: message
      };

      if (imageUrl) {
        payload.image_url = imageUrl;
      }

      console.log('[ChatService] 发送消息到后端:', BASE_URL);
      const response = await apiClient.post('/api/chat', payload);
      console.log('[ChatService] 后端响应成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ChatService] 请求失败:', error);

      // 详细的错误处理
      if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        throw new Error('无法连接到后端服务，请确保后端已启动');
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      } else if (error.response) {
        // 后端返回了错误响应
        const status = error.response.status;
        if (status >= 500) {
          throw new Error('服务器内部错误，请稍后重试');
        } else if (status === 404) {
          throw new Error('API接口不存在');
        } else {
          throw new Error(error.response.data.detail || '服务端错误');
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        throw new Error('网络无响应，请检查后端服务是否运行');
      } else {
        throw new Error(error.message || '网络错误，请稍后重试');
      }
    }
  }

  /**
   * 发送流式聊天消息
   * @param {string} message - 用户消息
   * @param {string} imageUrl - 图片URL（可选）
   * @param {Function} onChunk - 接收每个文本片段的回调函数
   * @param {Function} onComplete - 完成时的回调函数（参数：{vectorSearch}）
   * @param {Function} onError - 错误时的回调函数
   */
  async sendMessageStream(message, imageUrl = null, onChunk, onComplete, onError) {
    console.log('[ChatService] === 开始流式请求 ===', message);

    try {
      const payload = {
        message: message
      };

      if (imageUrl) {
        payload.image_url = imageUrl;
      }

      const url = `${BASE_URL}/api/chat/stream`;
      console.log('[ChatService] 流式请求URL:', url);
      console.log('[ChatService] 请求体:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;
      let vectorSearchData = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[ChatService] === 流式读取完成，共', chunkCount, '个chunk ===');
          if (onComplete) onComplete({ vectorSearch: vectorSearchData });
          return; // 使用return而不是break，确保退出
        }

        // 解码并处理数据
        buffer += decoder.decode(value, { stream: true });

        // 按行分割处理SSE格式
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留未完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              console.log('[ChatService] === 收到[DONE]标记，共', chunkCount, '个chunk ===');
              if (onComplete) onComplete({ vectorSearch: vectorSearchData });
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                console.error('[ChatService] 流式响应错误:', parsed.error);
                if (onError) onError(new Error(parsed.error));
                return;
              }
              // 保存向量检索数据
              if (parsed.vector_search) {
                vectorSearchData = parsed.vector_search;
                console.log('[ChatService] === 收到向量检索数据 ===', vectorSearchData);
              }
              if (parsed.content) {
                chunkCount++;
                console.log(`[ChatService] === 收到chunk #${chunkCount}: "${parsed.content}" ===`);
                if (onChunk) onChunk(parsed.content);
              }
            } catch (e) {
              console.warn('[ChatService] 解析SSE数据失败:', data, e);
            }
          }
        }
      }

    } catch (error) {
      console.error('[ChatService] === 流式请求失败 ===', error);

      // 详细的错误处理
      let errorMessage = '网络错误，请稍后重试';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = '无法连接到后端服务，请确保后端已启动';
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接或稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (onError) onError(new Error(errorMessage));
    }
  }

  /**
   * 上传并分析食物图片
   * @param {File} file - 图片文件
   * @returns {Promise} 分析结果
   */
  async analyzeFoodImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${BASE_URL}/api/analyze-food`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 健康检查
   * @returns {Promise} 健康状态
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// 创建单例实例
const chatService = new ChatService();

export default chatService;
