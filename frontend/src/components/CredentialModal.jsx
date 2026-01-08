import React, { useState, useEffect, useRef } from 'react';
import ConfirmModal from './ConfirmModal';
import CredentialService from '../services/credentialService';
import './CredentialModal.css';

/**
 * 密钥配置弹层组件
 * 点击设置按钮打开的模态对话框
 */
function CredentialModal({ isOpen, onClose, onCredentialsReady }) {
  const [credentials, setCredentials] = useState({
    appId: '',
    appSecret: '',
    apikey: ''
  });
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadTestConfirm, setShowLoadTestConfirm] = useState(false);
  const [isTestCredentials, setIsTestCredentials] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // 打开时检查是否有已保存的密钥
      if (CredentialService.isCredentialsComplete()) {
        const saved = CredentialService.getAllCredentials();
        setCredentials(saved);
        // 检查是否是测试密钥
        const testAppId = '48d1c03e005840c1b1eaa84e3571dfa5';
        if (saved.appId === testAppId) {
          setIsTestCredentials(true);
        }
      } else {
        // 没有保存的密钥，重置为空
        setCredentials({ appId: '', appSecret: '', apikey: '' });
        setIsTestCredentials(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // 点击背景关闭
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    const validation = CredentialService.validateCredentials(credentials);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      CredentialService.setCredentials({
        [CredentialService.CREDENTIAL_TYPES.XINGYUN_APP_ID]: credentials.appId,
        [CredentialService.CREDENTIAL_TYPES.XINGYUN_APP_SECRET]: credentials.appSecret,
        [CredentialService.CREDENTIAL_TYPES.MODELSCOPE_API_KEY]: credentials.apikey
      });

      if (onCredentialsReady) onCredentialsReady(credentials);
      onClose();
    } catch (error) {
      setErrors(['密钥保存失败：' + error.message]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestKeyLoad = () => {
    setShowLoadTestConfirm(true);
  };

  const confirmLoadTestKey = () => {
    setShowLoadTestConfirm(false);
    const testCredentials = {
      appId: '48d1c03e005840c1b1eaa84e3571dfa5',
      appSecret: 'bdd2e69045ca432ab5f2f5ab79e45091',
      apikey: 'ms-400ccec2-1d3b-4837-ae5b-57cc43eadfe1'
    };
    setCredentials(testCredentials);
    setIsTestCredentials(true);
    setErrors([]);
  };

  const cancelLoadTestKey = () => {
    setShowLoadTestConfirm(false);
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setShowClearConfirm(false);
    CredentialService.clearAllCredentials();
    setCredentials({ appId: '', appSecret: '', apikey: '' });
    setIsTestCredentials(false);
  };

  const cancelClear = () => {
    setShowClearConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2>服务密钥配置</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-item">⚠️ {error}</div>
              ))}
            </div>
          )}

          <div className="form-intro">
            <p>请配置魔珐星云和ModelScope的密钥信息以使用健康咨询服务</p>
          </div>

          <div className="form-group">
            <label>魔珐星云 App ID</label>
            <div className="input-with-toggle">
              <input
                type="password"
                value={credentials.appId}
                onChange={(e) => setCredentials({...credentials, appId: e.target.value})}
                placeholder={isTestCredentials ? '测试密钥已加载' : '请输入App ID'}
                disabled={isTestCredentials}
                className={isTestCredentials ? 'input-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label>魔珐星云 App Secret</label>
            <div className="input-with-toggle">
              <input
                type="password"
                value={credentials.appSecret}
                onChange={(e) => setCredentials({...credentials, appSecret: e.target.value})}
                placeholder={isTestCredentials ? '测试密钥已加载' : '请输入App Secret'}
                disabled={isTestCredentials}
                className={isTestCredentials ? 'input-disabled' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label>ModelScope API Key</label>
            <div className="input-with-toggle">
              <input
                type="password"
                value={credentials.apikey}
                onChange={(e) => setCredentials({...credentials, apikey: e.target.value})}
                placeholder={isTestCredentials ? '测试密钥已加载' : '格式: ms-xxxxxxxx'}
                disabled={isTestCredentials}
                className={isTestCredentials ? 'input-disabled' : ''}
              />
            </div>
          </div>

          <div className="test-key-section">
            <button type="button" className="btn-test-key" onClick={handleTestKeyLoad}>
              📋 加载测试密钥
            </button>
            {isTestCredentials && (
              <span className="test-key-badge">🔒 测试密钥模式</span>
            )}
          </div>

          <div className="security-notice">
            <span className="notice-icon">🔒</span>
            <span>密钥使用AES-256加密存储在本地浏览器中</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-clear" onClick={handleClear}>
            清除密钥
          </button>
          <div className="footer-right">
            <button className="btn-cancel" onClick={onClose}>
              取消
            </button>
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* 加载测试密钥确认弹窗 */}
        <ConfirmModal
          isOpen={showLoadTestConfirm}
          title="加载测试密钥"
          message="确定要加载测试密钥吗？测试密钥仅用于开发测试。"
          onConfirm={confirmLoadTestKey}
          onCancel={cancelLoadTestKey}
        />

        {/* 清除密钥确认弹窗 */}
        <ConfirmModal
          isOpen={showClearConfirm}
          title="清除密钥"
          message="确定要清除所有密钥吗？清除后需要重新配置。"
          onConfirm={confirmClear}
          onCancel={cancelClear}
        />
      </div>
    </div>
  );
}

export default CredentialModal;
