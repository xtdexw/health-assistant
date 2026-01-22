import React, { useState, useEffect } from 'react';
import CredentialModal from './components/CredentialModal';
import ChatPanel from './components/ChatPanel';
import ConfirmModal from './components/ConfirmModal';
import avatarService from './services/avatarService';
import CredentialService from './services/credentialService';
import './App.css';

/**
 * 从SDK消息中提取用户友好的错误信息
 */
function extractSDKErrorMessage(message) {
  const msg = message.message || '';

  // 优先提取包含实际描述的消息（如"您的积分不足, 请及时充值"）
  // 而不是技术性消息（如"startSession请求失败"）

  // 提取 "Error: " 后面的内容
  const errorMatch = msg.match(/Error:\s*(.+)/);
  if (!errorMatch) {
    return msg;
  }

  let errorText = errorMatch[1];

  // 移除错误码前缀 (如 "10003, ")
  errorText = errorText.replace(/^\d+,\s*/, '');

  // 移除 [ResourceManager] 标记
  errorText = errorText.replace(/\[ResourceManager\]\s*Error:\s*/, '');

  // 过滤掉纯技术性的错误消息
  const technicalErrors = [
    'startSession请求失败',
    'stopSession请求失败',
    '请求失败',
    'session错误'
  ];

  if (technicalErrors.some(techErr => errorText.includes(techErr))) {
    // 如果是纯技术性错误，尝试从原始消息中找更有用的信息
    // 或者返回一个通用的友好提示
    return errorText.includes('积分') ? errorText : '服务连接失败，请检查密钥配置或账户余额';
  }

  return errorText;
}

/**
 * 主应用组件
 * 健康咨询数字人 - 简洁版界面
 */
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [avatarState, setAvatarState] = useState('offline');
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  useEffect(() => {
    // 检查是否已配置密钥
    setHasCredentials(CredentialService.isCredentialsComplete());

    // 监听数字人状态变化
    const handleStateChange = (eventType, data) => {
      if (eventType === 'state') {
        setAvatarState(data);
      }
    };

    avatarService.onStateChange(handleStateChange);

    return () => {
      avatarService.offStateChange(handleStateChange);
    };
  }, []);

  const handleCredentialsReady = (creds) => {
    setHasCredentials(true);
    setConnectionError(null);
  };

  const handleConnect = async () => {
    // 先检查是否有密钥
    const credentials = CredentialService.getAllCredentials();
    if (!credentials.appId || !credentials.appSecret) {
      setShowCredentialModal(true);
      return;
    }

    if (typeof window.XmovAvatar === 'undefined') {
      setConnectionError('SDK未加载，请刷新页面重试');
      return;
    }

    const container = document.getElementById('avatar-container');
    if (!container) {
      setConnectionError('找不到数字人容器元素');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const credentials = CredentialService.getAllCredentials();

      // 检查密钥是否完整
      if (!credentials.appId || !credentials.appSecret) {
        throw new Error('密钥配置不完整，请重新配置');
      }

      const config = {
        containerId: 'avatar-container',
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        gatewayServer: credentials.gatewayServer,
        enableLogger: true,

        onStateChange: (state) => {
          setAvatarState(state);
        },

        onStatusChange: (status) => {
          if (status === 4) {
            setIsConnected(false);
            setAvatarState('offline');
          }
        },

        onMessage: (message) => {
          // 处理各种错误类型
          let errorMsg = null;

          if (message.code === 1) {
            // 成功消息，不处理
            return;
          } else if (message.code !== 1) {
            // 所有错误码都直接显示SDK原始消息
            errorMsg = extractSDKErrorMessage(message);
          }

          if (errorMsg) {
            console.error('[App] SDK错误:', message);
            setConnectionError(errorMsg);
            setIsConnecting(false);
            setIsConnected(false);
            setAvatarState('offline');
          }
        }
      };

      await avatarService.initialize(config);

      await avatarService.init({
        onDownloadProgress: (progress) => {
          }
      });

      setIsConnected(true);
      setAvatarState('idle');
      setConnectionError(null);

      // 连接成功后，打招呼
      setTimeout(() => {
        avatarService.speak('您好，我是健康咨询小星，很高兴为您服务！我可以为您提供营养分析、健身指导、亚健康调理和健康知识普及服务。请问有什么可以帮您的？', true, true);
      }, 1000);

    } catch (error) {
      setConnectionError(error.message || '连接失败，请检查密钥配置');
      setIsConnected(false);
      setAvatarState('offline');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = async () => {
    setShowDisconnectConfirm(false);
    try {
      // 先手动清空容器，避免React和SDK同时删除DOM元素导致冲突
      const container = document.getElementById('avatar-container');
      if (container) {
        container.innerHTML = '';
      }
      await avatarService.destroy();

      setIsConnected(false);
      setAvatarState('offline');
      setConnectionError(null);

      } catch (error) {
      setConnectionError('断开连接失败: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const cancelDisconnect = () => {
    setShowDisconnectConfirm(false);
  };

  const getStatusText = () => {
    if (isConnecting) return '连接中...';
    if (isConnected) return '在线';
    return '离线';
  };

  const getStatusClass = () => {
    if (isConnecting) return 'status-connecting';
    if (isConnected) return 'status-online';
    return 'status-offline';
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💚</span>
            <h1>健康咨询小星</h1>
          </div>
          <p className="subtitle">您的7×24小时AI健康管家</p>
        </div>

        <div className="header-right">
          {/* 连接状态指示器 */}
          <div className={'connection-status-mini ' + getStatusClass()}>
            <span className="status-dot"></span>
            <span className="status-text-mini">{getStatusText()}</span>
          </div>

          {/* 连接按钮（未连接时显示） */}
          {!isConnected && !isConnecting && (
            <button
              className="btn-connect-header"
              onClick={handleConnect}
              title="连接数字人"
            >
              连接
            </button>
          )}

          {/* 断开连接按钮（仅连接后显示） */}
          {isConnected && (
            <button
              className="icon-btn disconnect-btn"
              onClick={handleDisconnect}
              title="断开连接"
            >
              🔌
            </button>
          )}

          {/* 配置按钮 */}
          <button
            className="icon-btn settings-btn"
            onClick={() => setShowCredentialModal(true)}
            title="配置密钥"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="main-layout">
          {/* 数字人展示区 */}
          <div className="avatar-section">
            <div className="avatar-stage">
              <div
                id="avatar-container"
                className="avatar-display"
                style={{ width: '100%', height: '100%' }}
              >
              </div>

              {/* 连接中占位符 - 独立的覆盖层 */}
              {isConnecting && (
                <div className="avatar-placeholder-overlay">
                  <div className="avatar-placeholder">
                    <div className="placeholder-icon">⏳</div>
                    <p>正在连接健康助手...</p>
                  </div>
                </div>
              )}

              {connectionError && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span>{connectionError}</span>
                </div>
              )}

              {/* 功能提示 - 连接后显示 */}
              {isConnected && (
                <div className="function-hint">
                  <span className="hint-icon">💡</span>
                  <span>我可以帮您：营养分析 · 健身指导 · 亚健康调理 · 健康问答</span>
                </div>
              )}
            </div>
          </div>

          {/* 聊天面板 */}
          <div className="chat-wrapper">
            <ChatPanel sdk={avatarService} isConnected={isConnected} />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>健康建议仅供参考，不能替代专业医疗诊断</p>
      </footer>

      {/* 密钥配置弹层 */}
      <CredentialModal
        isOpen={showCredentialModal}
        onClose={() => setShowCredentialModal(false)}
        onCredentialsReady={handleCredentialsReady}
      />

      {/* 断开连接确认弹窗 */}
      <ConfirmModal
        isOpen={showDisconnectConfirm}
        title="断开连接"
        message="确定要断开数字人连接吗？"
        onConfirm={confirmDisconnect}
        onCancel={cancelDisconnect}
      />
    </div>
  );
}

export default App;
