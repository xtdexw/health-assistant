import React, { useState, useEffect, useRef } from 'react';
import CredentialService from '../services/credentialService';
import './CredentialManager.css';

/**
 * 密钥管理组件
 * 负责用户密钥的输入、验证和加密存储
 */
function CredentialManager({ onCredentialsReady, onLogout }) {
  const [credentials, setCredentials] = useState({
    appId: '',
    appSecret: '',
    apikey: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 只在组件首次挂载时执行一次
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // 检查是否已有密钥
    if (CredentialService.isCredentialsComplete()) {
      const saved = CredentialService.getAllCredentials();
      setCredentials(saved);
      setIsSaved(true);
      if (onCredentialsReady) onCredentialsReady(saved);
    } else {
      setShowForm(true);
    }
  }, []); // 空依赖数组，只在挂载时执行

  const handleSave = () => {
    // 验证密钥格式
    const validation = CredentialService.validateCredentials(credentials);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // 清除错误
    setErrors([]);

    // 加密存储密钥
    try {
      CredentialService.setCredentials({
        [CredentialService.CREDENTIAL_TYPES.XINGYUN_APP_ID]: credentials.appId,
        [CredentialService.CREDENTIAL_TYPES.XINGYUN_APP_SECRET]: credentials.appSecret,
        [CredentialService.CREDENTIAL_TYPES.MODELSCOPE_API_KEY]: credentials.apikey
      });

      setIsSaved(true);
      setShowForm(false);
      if (onCredentialsReady) onCredentialsReady(credentials);
    } catch (error) {
      setErrors(['密钥保存失败：' + error.message]);
    }
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有密钥吗？清除后需要重新配置。')) {
      CredentialService.clearAllCredentials();
      setCredentials({ appId: '', appSecret: '', apikey: '' });
      setIsSaved(false);
      setShowForm(true);
      if (onLogout) onLogout();
    }
  };

  const handleTestKeyLoad = () => {
    // 加载测试密钥（混淆加密处理）
    // 注意：实际生产环境中应删除此功能或通过后端验证
    if (window.confirm('确定要加载测试密钥吗？\n\n⚠️ 这仅用于开发测试，生产环境请使用正式密钥。')) {
      const testCredentials = {
        appId: atob('cGRfaGVhbHRoX2Fzc2lzdGFudF90ZXN0'), // base64编码
        appSecret: atob('dGVzdF9zZWNyZXRfaGVhbHRoXzIwMjU='),
        apikey: atob('bXMtMTEwYjgwZjktYWU1YS00NTkwLTkxZDQtMDhiYzhlNTQ2MDNh')
      };
      setCredentials(testCredentials);
      setErrors([]);
    }
  };

  return (
    <div className="credential-manager">
      {isSaved && !showForm ? (
        <div className="credentials-status">
          <div className="status-item">
            <span className="status-icon">✓</span>
            <span className="status-text">密钥已配置</span>
            <button
              className="btn-secondary"
              onClick={() => setShowForm(true)}
            >
              修改密钥
            </button>
            <button
              className="btn-danger"
              onClick={handleClear}
            >
              清除密钥
            </button>
          </div>
        </div>
      ) : (
        <div className="credentials-form">
          <h3>配置服务密钥</h3>
          <p className="form-hint">
            请填写魔珐星云和ModelScope的密钥信息以使用AI健康咨询服务
          </p>

          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-item">⚠️ {error}</div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="appId">
              魔珐星云 App ID <span className="required">*</span>
            </label>
            <input
              id="appId"
              type="text"
              value={credentials.appId}
              onChange={(e) => setCredentials({...credentials, appId: e.target.value})}
              placeholder="例如: pd_health_assistant_test"
              className="form-input"
            />
            <small className="input-hint">在魔珐星云平台创建应用后获取</small>
          </div>

          <div className="form-group">
            <label htmlFor="appSecret">
              魔珐星云 App Secret <span className="required">*</span>
            </label>
            <input
              id="appSecret"
              type="password"
              value={credentials.appSecret}
              onChange={(e) => setCredentials({...credentials, appSecret: e.target.value})}
              placeholder="请输入App Secret"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apikey">
              ModelScope API Key <span className="required">*</span>
            </label>
            <input
              id="apikey"
              type="password"
              value={credentials.apikey}
              onChange={(e) => setCredentials({...credentials, apikey: e.target.value})}
              placeholder="格式: ms-xxxxxxxx"
              className="form-input"
            />
            <small className="input-hint">ModelScope平台的API密钥，格式为ms-开头</small>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>
              保存密钥
            </button>
            <button className="btn-secondary" onClick={handleTestKeyLoad}>
              加载测试密钥
            </button>
            {isSaved && (
              <button className="btn-cancel" onClick={() => setShowForm(false)}>
                取消
              </button>
            )}
          </div>

          <div className="security-notice">
            <div className="notice-icon">🔒</div>
            <div className="notice-content">
              <strong>安全保障</strong>
              <small>密钥将使用AES-256加密后存储在本地浏览器中，不会上传到任何服务器</small>
            </div>
          </div>

          <div className="help-links">
            <a href="https://xingyun3d.com/" target="_blank" rel="noopener noreferrer">
              如何获取魔珐星云密钥？
            </a>
            <a href="https://modelscope.cn/" target="_blank" rel="noopener noreferrer">
              如何获取ModelScope密钥？
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default CredentialManager;
