import React, { useState, useRef, useEffect } from 'react';
import chatService from '../services/chatService';
import './ChatPanel.css';
import VectorSearchBadge from './VectorSearchBadge';

/**
 * 聊天面板组件
 * 提供完整的对话交互界面
 */
function ChatPanel({ sdk, isConnected }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 添加消息到聊天历史
  const addMessage = (role, content, type = 'text', extraData = {}) => {
    const message = {
      id: Date.now(),
      role,
      content,
      type,
      timestamp: new Date().toLocaleTimeString(),
      ...extraData
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  // 发送文本消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !isConnected) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');

    // 添加用户消息
    addMessage('user', userMessage);

    // 切换数字人到倾听状态
    if (sdk) {
      sdk.listen();
    }

    setIsLoading(true);

    try {
      // 发送到后端
      const response = await chatService.sendMessage(userMessage);

      // 切换到思考状态
      if (sdk) {
        sdk.think();
      }

      // 等待短暂时间模拟思考
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 添加AI回复
      addMessage('assistant', response.response, 'text', {
        vectorSearch: response.vector_search,
        intent: response.intent
      });

      // 切换到说话状态
      if (sdk) {
        sdk.speak(response.response, true, true);
      }

    } catch (error) {
      addMessage('system', `错误: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 验证文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  // 发送图片分析请求
  const handleAnalyzeImage = async () => {
    if (!imageFile || isLoading || !isConnected) {
      return;
    }

    // 添加图片消息
    addMessage('user', '[图片]', 'image');

    if (sdk) {
      sdk.listen();
    }

    setIsLoading(true);
    const currentFile = imageFile;
    setImageFile(null);
    setImagePreview(null);

    try {
      // 分析图片
      const response = await chatService.analyzeFoodImage(currentFile);

      // 移除思考消息
      setMessages(prev => prev.filter(m => m.type !== 'thinking'));

      if (sdk) {
        sdk.think();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 添加分析结果
      addMessage('assistant', response.analysis);

      if (sdk) {
        sdk.speak(response.analysis, true, true);
      }

    } catch (error) {
      setMessages(prev => prev.filter(m => m.type !== 'thinking'));
      addMessage('system', `图片分析失败: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      // 重置file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 清除图片预览
  const clearImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 常用问题快捷按钮
  const quickQuestions = [
    { text: '今天午餐吃什么比较健康？', icon: '🍱️' },
    { text: '如何改善睡眠质量？', icon: '😴' },
    { text: '上班族如何保持健康？', icon: '💼' },
    { text: '有什么简单的减肥建议？', icon: '🏃' }
  ];

  return (
    <div className="chat-panel">
      {/* 聊天头部 */}
      <div className="chat-header">
        <h3>💬 健康咨询</h3>
        <p className="subtitle">向健康助手小星提问，获取专业建议</p>
      </div>

      {/* 快捷问题 */}
      {messages.length === 0 && (
        <div className="quick-questions">
          <p className="quick-title">快捷提问：</p>
          <div className="quick-buttons">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                className="quick-btn"
                onClick={() => setInputText(q.text)}
                disabled={!isConnected || isLoading}
              >
                <span className="quick-icon">{q.icon}</span>
                <span className="quick-text">{q.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👋</div>
            <p>您好！我是健康咨询助手小星</p>
            <small>请输入您的问题，或使用上方快捷按钮</small>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.type === 'image' && msg.role === 'user' && (
                <div className="message-image">
                  📷 [图片]
                </div>
              )}
              {msg.type === 'error' && (
                <div className="error-message">
                  ⚠️ {msg.content}
                </div>
              )}
              {msg.type === 'thinking' && (
                <div className="thinking-message">
                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  {msg.content}
                </div>
              )}
              {msg.type === 'text' && (
                <>
                  <div className="text-content">{msg.content}</div>
                  {msg.vectorSearch && (
                    <VectorSearchBadge vectorSearch={msg.vectorSearch} />
                  )}
                </>
              )}
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-assistant">
            <div className="message-content">
              <div className="thinking-message">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                正在思考...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 图片预览区 */}
      {imagePreview && (
        <div className="image-preview">
          <div className="preview-image">
            <img src={imagePreview} alt="Preview" />
            <button className="clear-image-btn" onClick={clearImagePreview}>
              ✕
            </button>
          </div>
          <button
            className="analyze-image-btn"
            onClick={handleAnalyzeImage}
            disabled={isLoading}
          >
            🔍 分析图片
          </button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="input-area">
        <div className="input-row">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={isConnected ? "输入您的问题..." : "请先连接数字人"}
            disabled={!isConnected || isLoading}
            className="chat-input"
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !isConnected || isLoading}
            title="发送消息"
          >
            {isLoading ? '⏳' : '发送'}
          </button>
          <button
            className="image-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isLoading}
            title="上传图片"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </div>
        <div className="input-hint">
          <small>
            💡 提示：按 Enter 发送，Shift + Enter 换行 | 支持上传食物图片分析
          </small>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
