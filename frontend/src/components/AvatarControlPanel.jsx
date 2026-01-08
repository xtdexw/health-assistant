import React, { useState } from 'react';
import avatarService from '../services/avatarService';
import './AvatarControlPanel.css';

/**
 * 数字人连接控制面板
 * 负责数字人的连接、断开、状态控制和高级功能
 */
function AvatarControlPanel({ isConnected, isConnecting, avatarState, onConnect, onDisconnect }) {
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);

  const handleConnectClick = async () => {
    if (onConnect) await onConnect();
    setShowControls(true);
  };

  const handleDisconnectClick = async () => {
    try {
      if (window.confirm('确定要断开数字人连接吗？')) {
        if (onDisconnect) await onDisconnect();
        setShowControls(false);
      }
    } catch (error) {
      alert('断开连接失败: ' + error.message);
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    if (isConnecting) return '#eab308';
    if (isConnected) return '#22c55e';
    return '#9ca3af';
  };

  // 获取状态文本
  const getStatusText = () => {
    if (isConnecting) return '连接中...';
    if (isConnected) return '已连接';
    return '未连接';
  };

  // 状态切换处理
  const handleStateChange = async (state) => {
    try {
      switch (state) {
        case 'listen':
          avatarService.listen();
          break;
        case 'think':
          avatarService.think();
          break;
        case 'interactiveIdle':
          avatarService.interactiveIdle();
          break;
        case 'idle':
          avatarService.idle();
          break;
        case 'offline':
          avatarService.offlineMode();
          break;
        case 'online':
          avatarService.onlineMode();
          break;
      }
    } catch (error) {
      }
  };

  // 音量控制
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    avatarService.setVolume(newVolume);
  };

  return (
    <div className="avatar-control-panel">
      {/* 状态指示器 */}
      <div className="connection-status">
        <div className="status-header">
          <div
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <span className="status-text">{getStatusText()}</span>
          {avatarState && avatarState !== 'offline' && (
            <span className="current-state">| {avatarState}</span>
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="control-buttons">
        {!isConnected && !isConnecting ? (
          <button className="btn-connect" onClick={handleConnectClick}>
            连接数字人
          </button>
        ) : isConnected ? (
          <>
            <button className="btn-disconnect" onClick={handleDisconnectClick}>
              断开连接
            </button>
          </>
        ) : (
          <button className="btn-connect" disabled>
            连接中...
          </button>
        )}
      </div>

      {/* 高级控制面板 */}
      {showControls && isConnected && (
        <div className="advanced-controls">
          <div className="control-section">
            <h4>状态控制</h4>
            <div className="state-buttons">
              <button onClick={() => handleStateChange('listen')} title="倾听状态">
                👂 倾听
              </button>
              <button onClick={() => handleStateChange('think')} title="思考状态">
                🤔 思考
              </button>
              <button onClick={() => handleStateChange('interactiveIdle')} title="交互待机">
                💬 待机
              </button>
              <button onClick={() => handleStateChange('idle')} title="待机状态">
                😴 离线
              </button>
            </div>
          </div>

          <div className="control-section">
            <h4>模式切换</h4>
            <div className="mode-buttons">
              <button onClick={() => handleStateChange('online')} className="mode-online">
                🟢 在线模式
              </button>
              <button onClick={() => handleStateChange('offline')} className="mode-offline">
                ⚪ 离线模式
              </button>
            </div>
            <small className="mode-hint">离线模式不消耗积分，适合长时间不使用时</small>
          </div>

          <div className="control-section">
            <h4>音量控制</h4>
            <div className="volume-control">
              <span className="volume-label">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-value">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          <div className="control-section">
            <h4>调试选项</h4>
            <div className="debug-buttons">
              <button onClick={() => avatarService.showDebugInfo()}>
                显示调试信息
              </button>
              <button onClick={() => avatarService.hideDebugInfo()}>
                隐藏调试信息
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarControlPanel;
