import axios, { AxiosRequestConfig } from 'axios';

// API调用控制配置接口
interface ApiControlConfig {
  isEnabled: boolean; // API调用开关
  requestInterval: number; // 请求间隔（毫秒）
  dailyLimit: number; // 每日调用次数限制
  sessionLimit: number; // 单次会话（30分钟）内的调用次数限制
}

// API调用记录接口
interface ApiCallRecord {
  timestamp: number; // 调用时间戳
  url: string; // 调用的URL
  method: string; // HTTP方法
  success: boolean; // 是否成功
  statusCode?: number; // 状态码
}

// API调用状态接口
interface ApiControlState {
  dailyCallCount: number; // 今日调用次数
  sessionCallCount: number; // 会话内调用次数
  lastCallTime: number; // 最后一次调用时间
  sessionStartTime: number; // 会话开始时间
  callRecords: ApiCallRecord[]; // 调用记录
}

// API调用控制类
class ApiControl {
  private config: ApiControlConfig;
  private state: ApiControlState;
  private readonly STORAGE_KEY_CONFIG = 'api_control_config';
  private readonly STORAGE_KEY_STATE = 'api_control_state';
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30分钟会话

  constructor() {
    // 从localStorage加载配置
    const savedConfig = localStorage.getItem(this.STORAGE_KEY_CONFIG);
    this.config = savedConfig
      ? JSON.parse(savedConfig)
      : {
          isEnabled: false, // 默认关闭
          requestInterval: 10000, // 10秒间隔
          dailyLimit: 50, // 每日50次
          sessionLimit: 5, // 30分钟内5次
        };

    // 从localStorage加载状态
    const savedState = localStorage.getItem(this.STORAGE_KEY_STATE);
    this.state = savedState ? this.validateState(JSON.parse(savedState)) : this.getInitialState();

    // 保存初始配置
    this.saveConfig();
    this.saveState();

    // 设置定时清理任务
    this.setupCleanupTasks();
  }

  // 获取初始状态
  private getInitialState(): ApiControlState {
    return {
      dailyCallCount: 0,
      sessionCallCount: 0,
      lastCallTime: 0,
      sessionStartTime: Date.now(),
      callRecords: [],
    };
  }

  // 验证状态数据
  private validateState(state: any): ApiControlState {
    const today = this.getTodayString();
    const savedDate = state.lastResetDate || '';

    // 如果是新的一天，重置统计数据
    if (savedDate !== today) {
      return {
        ...state,
        dailyCallCount: 0,
        sessionCallCount: 0,
        lastCallTime: 0,
        sessionStartTime: Date.now(),
        callRecords: state.callRecords.slice(-100), // 保留最近100条记录
      };
    }

    // 检查会话是否过期
    const now = Date.now();
    if (now - state.sessionStartTime > this.SESSION_DURATION) {
      return {
        ...state,
        sessionCallCount: 0,
        sessionStartTime: now,
      };
    }

    return state;
  }

  // 获取今天的日期字符串（YYYY-MM-DD）
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // 保存配置到localStorage
  private saveConfig(): void {
    localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(this.config));
  }

  // 保存状态到localStorage
  private saveState(): void {
    localStorage.setItem(this.STORAGE_KEY_STATE, JSON.stringify({
      ...this.state,
      lastResetDate: this.getTodayString(),
    }));
  }

  // 设置定时清理任务
  private setupCleanupTasks(): void {
    // 每天凌晨重置一次
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const delay = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyStats();
      this.setupCleanupTasks(); // 重新设置明天的任务
    }, delay);
  }

  // 重置每日统计数据
  private resetDailyStats(): void {
    this.state = {
      ...this.state,
      dailyCallCount: 0,
      sessionCallCount: 0,
      lastCallTime: 0,
      sessionStartTime: Date.now(),
    };
    this.saveState();
  }

  // 检查API调用是否允许
  public checkApiCallAllowed(config: AxiosRequestConfig): { allowed: boolean; message?: string } {
    // 检查API是否启用
    if (!this.config.isEnabled) {
      return { allowed: false, message: 'API调用功能已关闭，请在设置中开启' };
    }

    const now = Date.now();

    // 检查请求间隔
    if (now - this.state.lastCallTime < this.config.requestInterval) {
      const remainingTime = Math.ceil((this.config.requestInterval - (now - this.state.lastCallTime)) / 1000);
      return { allowed: false, message: `请求过于频繁，请等待${remainingTime}秒后再试` };
    }

    // 检查每日调用限制
    if (this.state.dailyCallCount >= this.config.dailyLimit) {
      return { allowed: false, message: `今日API调用次数已达上限（${this.config.dailyLimit}次）` };
    }

    // 检查会话调用限制
    if (now - this.state.sessionStartTime > this.SESSION_DURATION) {
      // 会话已过期，重置会话计数
      this.state.sessionCallCount = 0;
      this.state.sessionStartTime = now;
    }

    if (this.state.sessionCallCount >= this.config.sessionLimit) {
      return { allowed: false, message: `30分钟内API调用次数已达上限（${this.config.sessionLimit}次）` };
    }

    // 检查是否接近每日限制的80%
    const is接近限制 = this.state.dailyCallCount >= this.config.dailyLimit * 0.8;
    if (is接近限制) {
      console.warn(`API调用警告：今日已使用${this.state.dailyCallCount}次，接近每日限制的80%`);
    }

    return { allowed: true };
  }

  // 记录API调用
  public recordApiCall(config: AxiosRequestConfig, success: boolean, statusCode?: number): void {
    const now = Date.now();
    const record: ApiCallRecord = {
      timestamp: now,
      url: config.url || '',
      method: config.method || 'GET',
      success,
      statusCode,
    };

    // 更新状态
    this.state = {
      ...this.state,
      dailyCallCount: this.state.dailyCallCount + 1,
      sessionCallCount: this.state.sessionCallCount + 1,
      lastCallTime: now,
      callRecords: [...this.state.callRecords, record].slice(-100), // 保留最近100条
    };

    this.saveState();
  }

  // 切换API开关状态
  public toggleEnabled(): boolean {
    this.config.isEnabled = !this.config.isEnabled;
    this.saveConfig();
    return this.config.isEnabled;
  }

  // 设置API开关状态
  public setEnabled(enabled: boolean): void {
    this.config.isEnabled = enabled;
    this.saveConfig();
  }

  // 更新配置
  public updateConfig(newConfig: Partial<ApiControlConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // 获取当前配置
  public getConfig(): ApiControlConfig {
    return { ...this.config };
  }

  // 获取当前状态
  public getState(): ApiControlState {
    return { ...this.state };
  }

  // 获取剩余调用次数
  public getRemainingCalls(): number {
    return this.config.dailyLimit - this.state.dailyCallCount;
  }

  // 清除调用记录
  public clearCallRecords(): void {
    this.state.callRecords = [];
    this.saveState();
  }

  // 获取调用统计信息
  public getStatistics(): {
    dailyUsage: number;
    dailyUsagePercentage: number;
    sessionUsage: number;
    sessionUsagePercentage: number;
    remainingCalls: number;
    timeSinceLastCall: number;
  } {
    return {
      dailyUsage: this.state.dailyCallCount,
      dailyUsagePercentage: (this.state.dailyCallCount / this.config.dailyLimit) * 100,
      sessionUsage: this.state.sessionCallCount,
      sessionUsagePercentage: (this.state.sessionCallCount / this.config.sessionLimit) * 100,
      remainingCalls: this.getRemainingCalls(),
      timeSinceLastCall: Date.now() - this.state.lastCallTime,
    };
  }
}

// 创建API控制实例
const apiControl = new ApiControl();

// 设置Axios请求拦截器
axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 检查API调用是否允许
    const checkResult = apiControl.checkApiCallAllowed(config);
    if (!checkResult.allowed) {
      throw new Error(checkResult.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 设置Axios响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 记录成功调用
    apiControl.recordApiCall(response.config, true, response.status);
    return response;
  },
  (error) => {
    // 记录失败调用
    if (error.config) {
      apiControl.recordApiCall(error.config, false, error.response?.status);
    }
    return Promise.reject(error);
  }
);

export { apiControl, ApiControlConfig, ApiControlState, ApiCallRecord };
