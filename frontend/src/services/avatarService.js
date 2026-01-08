/**
 * 数字人SDK服务封装
 * 负责魔珐星云SDK的初始化、状态管理和API调用
 */
class AvatarService {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.stateChangeCallbacks = [];
  }

  /**
   * 初始化SDK
   * @param {Object} config - SDK配置
   * @returns {Promise<Object>} SDK实例
   */
  async initialize(config) {
    const XmovAvatar = window.XmovAvatar;

    if (!XmovAvatar) {
      throw new Error('SDK未加载，请确保已引入xmovAvatar脚本');
    }

    return new Promise((resolve, reject) => {
      try {
        const avatarSDK = new XmovAvatar({
          containerId: config.containerId.startsWith('#') ? config.containerId : '#' + config.containerId,
          appId: config.appId,
          appSecret: config.appSecret,
          gatewayServer: config.gatewayServer || 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

          // 状态变化回调
          onStateChange: (state) => {
            this._notifyStateChange('state', state);
            if (config.onStateChange) {
              config.onStateChange(state);
            }
          },

          // SDK状态变化回调
          onStatusChange: (status) => {
            this._notifyStateChange('status', status);
            if (config.onStatusChange) {
              config.onStatusChange(status);
            }

            // 检测到断开连接
            if (status === 4) { // close
              this.isInitialized = false;
              this.sdk = null;
            }
          },

          // 消息回调
          onMessage: (message) => {
            if (config.onMessage) {
              config.onMessage(message);
            }

            // 错误处理
            if (message.code >= 50000) {
              this._notifyStateChange('networkError', message);
            }
          },

          // Widget事件回调
          onWidgetEvent: (data) => {
            if (config.onWidgetEvent) {
              config.onWidgetEvent(data);
            }
          },

          // 语音状态回调
          onVoiceStateChange: (status) => {
            this._notifyStateChange('voice', status);
            if (config.onVoiceStateChange) {
              config.onVoiceStateChange(status);
            }
          },

          // 自定义Widget处理
          proxyWidget: config.proxyWidget || {},

          // 是否显示日志
          enableLogger: config.enableLogger || false
        });

        this.sdk = avatarSDK;
        resolve(avatarSDK);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 初始化SDK连接
   * @param {Object} options - 初始化选项
   * @returns {Promise<void>}
   */
  async init(options = {}) {
    if (!this.sdk) {
      throw new Error('SDK未初始化，请先调用initialize()');
    }

    try {
      await this.sdk.init({
        onDownloadProgress: (progress) => {
          if (options.onDownloadProgress) {
            options.onDownloadProgress(progress);
          }
        }
      });

      this.isInitialized = true;
      } catch (error) {
      throw error;
    }
  }

  /**
   * 让数字人说话
   * @param {string} text - 说话内容
   * @param {boolean} isStart - 是否是开始
   * @param {boolean} isEnd - 是否是结束
   */
  speak(text, isStart = true, isEnd = true) {
    if (!this.sdk || !this.isInitialized) {
      return;
    }

    try {
      this.sdk.speak(text, isStart, isEnd);
    } catch (error) {
      }
  }

  /**
   * 流式说话（用于大模型流式输出）
   * @param {AsyncGenerator} textStream - 文本流
   */
  async speakStream(textStream) {
    if (!this.sdk || !this.isInitialized) {
      return;
    }

    let isFirst = true;
    let buffer = '';

    try {
      for await (const chunk of textStream) {
        buffer += chunk;

        // 积累一定长度后发送
        if (buffer.length > 20) {
          this.sdk.speak(buffer, isFirst, false);
          buffer = '';
          isFirst = false;
        }

        // 短暂延迟，确保数字人说话速度低于生成速度
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 发送剩余内容
      if (buffer) {
        this.sdk.speak(buffer, isFirst, true);
      }
    } catch (error) {
      }
  }

  /**
   * 切换到倾听状态
   */
  listen() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.listen();
    } catch (error) {
      }
  }

  /**
   * 切换到思考状态
   */
  think() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.think();
    } catch (error) {
      }
  }

  /**
   * 切换到交互待机状态
   */
  interactiveIdle() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.interactiveidle();
    } catch (error) {
      }
  }

  /**
   * 切换到待机状态
   */
  idle() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.idle();
    } catch (error) {
      }
  }

  /**
   * 切换到离线模式（不消耗积分）
   */
  offlineMode() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.offlineMode();
    } catch (error) {
      }
  }

  /**
   * 切换到在线模式
   */
  onlineMode() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.onlineMode();
    } catch (error) {
      }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值（0-1）
   */
  setVolume(volume) {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.setVolume(volume);
    } catch (error) {
      }
  }

  /**
   * 显示调试信息
   */
  showDebugInfo() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.showDebugInfo();
    } catch (error) {
      }
  }

  /**
   * 隐藏调试信息
   */
  hideDebugInfo() {
    if (!this.sdk || !this.isInitialized) return;
    try {
      this.sdk.hideDebugInfo();
    } catch (error) {
      }
  }

  /**
   * 销毁SDK
   * @returns {Promise<void>}
   */
  async destroy() {
    if (!this.sdk) return;

    try {
      await this.sdk.destroy();
      this.sdk = null;
      this.isInitialized = false;
      } catch (error) {
      throw error;
    }
  }

  /**
   * 注册状态变化回调
   * @param {Function} callback - 回调函数
   */
  onStateChange(callback) {
    if (typeof callback === 'function') {
      this.stateChangeCallbacks.push(callback);
    }
  }

  /**
   * 移除状态变化回调
   * @param {Function} callback - 回调函数
   */
  offStateChange(callback) {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * 通知状态变化
   * @private
   */
  _notifyStateChange(eventType, data) {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        }
    });
  }

  /**
   * 检查SDK是否已就绪
   * @returns {boolean}
   */
  isReady() {
    return this.sdk !== null && this.isInitialized;
  }
}

// 创建单例实例
const avatarService = new AvatarService();

export default avatarService;
