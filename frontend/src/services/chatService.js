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

      const response = await apiClient.post('/api/chat', payload);
      return response.data;
    } catch (error) {
      // 返回友好的错误信息
      if (error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到后端服务，请确保后端已启动');
      } else if (error.response) {
        throw new Error(error.response.data.detail || '服务端错误');
      } else {
        throw new Error('网络错误，请稍后重试');
      }
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
