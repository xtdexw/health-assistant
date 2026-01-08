/**
 * 密钥管理服务
 * 负责密钥的存储和读取
 * 注意：为了演示方便，使用明文存储。生产环境应使用加密。
 */
class CredentialService {
  // 存储的密钥类型
  static CREDENTIAL_TYPES = {
    XINGYUN_APP_ID: 'xingyun_app_id',
    XINGYUN_APP_SECRET: 'xingyun_app_secret',
    MODELSCOPE_API_KEY: 'modelscope_api_key'
  };

  /**
   * 存储密钥（明文存储）
   * @param {string} type - 密钥类型
   * @param {string} value - 密钥值
   */
  static setCredential(type, value) {
    if (!value) return;
    localStorage.setItem(`ha_${type}`, value);
  }

  /**
   * 获取密钥
   * @param {string} type - 密钥类型
   * @returns {string|null} 密钥值
   */
  static getCredential(type) {
    const value = localStorage.getItem(`ha_${type}`);
    return value || null;
  }

  /**
   * 批量设置密钥
   * @param {Object} credentials - 密钥对象
   */
  static setCredentials(credentials) {
    Object.entries(credentials).forEach(([key, value]) => {
      if (value) {
        this.setCredential(key, value);
      }
    });
  }

  /**
   * 清除所有密钥
   */
  static clearAllCredentials() {
    Object.values(this.CREDENTIAL_TYPES).forEach(type => {
      localStorage.removeItem(`ha_${type}`);
    });
  }

  /**
   * 检查密钥是否完整
   * @returns {boolean}
   */
  static isCredentialsComplete() {
    return Object.values(this.CREDENTIAL_TYPES).every(type =>
      this.getCredential(type) !== null
    );
  }

  /**
   * 获取所有密钥（用于SDK初始化）
   * @returns {Object}
   */
  static getAllCredentials() {
    return {
      appId: this.getCredential(this.CREDENTIAL_TYPES.XINGYUN_APP_ID),
      appSecret: this.getCredential(this.CREDENTIAL_TYPES.XINGYUN_APP_SECRET),
      apikey: this.getCredential(this.CREDENTIAL_TYPES.MODELSCOPE_API_KEY)
    };
  }

  /**
   * 验证密钥格式
   * @param {Object} credentials - 待验证的密钥对象
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validateCredentials(credentials) {
    const errors = [];

    if (!credentials.appId || credentials.appId.trim() === '') {
      errors.push('App ID不能为空');
    }

    if (!credentials.appSecret || credentials.appSecret.trim() === '') {
      errors.push('App Secret不能为空');
    }

    if (!credentials.apikey || credentials.apikey.trim() === '') {
      errors.push('API Key不能为空');
    } else if (!credentials.apikey.startsWith('ms-')) {
      errors.push('API Key格式不正确（应以ms-开头）');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default CredentialService;
