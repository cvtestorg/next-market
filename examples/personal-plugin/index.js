/**
 * Personal Plugin - 个人插件主文件
 */

class PersonalPlugin {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      enableFeature: config.enableFeature || false,
      maxRequests: config.maxRequests || 1000,
      ...config
    };
  }

  /**
   * 初始化插件
   */
  init() {
    console.log('Personal Plugin initialized');
    console.log('Config:', this.config);
    return this;
  }

  /**
   * 执行插件功能
   */
  execute() {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }
    return {
      success: true,
      message: 'Plugin executed successfully',
      config: this.config
    };
  }

  /**
   * 获取插件信息
   */
  getInfo() {
    return {
      name: 'personal-plugin',
      version: '1.0.0',
      description: '个人插件，提供个性化的功能和配置选项',
      features: {
        enabled: this.config.enableFeature,
        maxRequests: this.config.maxRequests
      }
    };
  }
}

module.exports = PersonalPlugin;

