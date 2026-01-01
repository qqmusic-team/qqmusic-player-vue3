interface RequestConfig {
  method: string;
  url: string;
  params?: any;
  data?: any;
  headers?: any;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers?: any;
  data: any;
}

interface ErrorInfo {
  type: string;
  message: string;
  status?: number;
  statusText?: string;
  requestId: string;
}

class NetworkLogger {
  private static instance: NetworkLogger;
  private requestIdCounter = 0;

  private constructor() {}

  static getInstance(): NetworkLogger {
    if (!NetworkLogger.instance) {
      NetworkLogger.instance = new NetworkLogger();
    }
    return NetworkLogger.instance;
  }

  generateRequestId(): string {
    this.requestIdCounter++;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `REQ-${timestamp}-${random}-${this.requestIdCounter}`;
  }

  formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  sanitizeData(data: any, depth = 0): any {
    if (depth > 5) {
      return "[Max Depth Reached]";
    }

    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === "string") {
      return this.sanitizeString(data);
    }

    if (typeof data !== "object") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item, depth + 1));
    }

    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();
        if (this.isSensitiveField(lowerKey)) {
          sanitized[key] = this.maskSensitiveValue(data[key]);
        } else {
          sanitized[key] = this.sanitizeData(data[key], depth + 1);
        }
      }
    }
    return sanitized;
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      "password",
      "pwd",
      "passwd",
      "secret",
      "token",
      "cookie",
      "session",
      "authorization",
      "auth",
      "apikey",
      "api_key",
      "accesskey",
      "access_key",
      "privatekey",
      "private_key",
      "credential",
      "credentials",
      "ssn",
      "creditcard",
      "credit_card",
      "phone",
      "mobile",
      "email",
      "address",
      "idcard",
      "id_card",
    ];
    return sensitiveFields.some((field) => fieldName.includes(field));
  }

  private maskSensitiveValue(value: any): string {
    if (typeof value === "string") {
      if (value.length <= 4) {
        return "****";
      }
      return value.substring(0, 2) + "****" + value.substring(value.length - 2);
    }
    return "****";
  }

  private sanitizeString(str: string): string {
    if (str.length > 500) {
      return str.substring(0, 500) + "...[truncated]";
    }
    return str;
  }

  logRequest(
    config: RequestConfig,
    requestId: string,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const timestamp = this.formatTimestamp();
    const prefix = `[${requestType} REQUEST]`;
    const separator = "=".repeat(80);

    console.log(separator);
    console.log(`${prefix} [${requestId}] ${timestamp}`);
    console.log(separator);
    console.log(`请求方法: ${config.method}`);
    console.log(`请求URL: ${config.url}`);

    if (config.params && Object.keys(config.params).length > 0) {
      console.log(`Query参数:`, this.sanitizeData(config.params));
    }

    if (config.data) {
      console.log(`Body数据:`, this.sanitizeData(config.data));
    }

    if (config.headers) {
      console.log(`请求头:`, this.sanitizeData(config.headers));
    }

    console.log(separator);
  }

  logResponse(
    response: ResponseData,
    requestId: string,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const timestamp = this.formatTimestamp();
    const prefix = `[${requestType} RESPONSE]`;
    const separator = "=".repeat(80);

    console.log(separator);
    console.log(`${prefix} [${requestId}] ${timestamp}`);
    console.log(separator);
    console.log(`响应状态码: ${response.status}`);
    console.log(`响应状态文本: ${response.statusText}`);

    if (response.headers) {
      console.log(`响应头:`, this.sanitizeData(response.headers));
    }

    console.log(`响应体:`, this.sanitizeData(response.data));
    console.log(separator);
  }

  logError(
    error: ErrorInfo,
    requestConfig?: RequestConfig,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const timestamp = this.formatTimestamp();
    const prefix = `[${requestType} ERROR]`;
    const separator = "=".repeat(80);

    console.error(separator);
    console.error(`${prefix} [${error.requestId}] ${timestamp}`);
    console.error(separator);
    console.error(`错误类型: ${error.type}`);
    console.error(`错误信息: ${error.message}`);

    if (error.status !== undefined) {
      console.error(`失败状态码: ${error.status}`);
    }

    if (error.statusText) {
      console.error(`状态文本: ${error.statusText}`);
    }

    if (requestConfig) {
      console.error(`请求方法: ${requestConfig.method}`);
      console.error(`请求URL: ${requestConfig.url}`);

      if (requestConfig.params && Object.keys(requestConfig.params).length > 0) {
        console.error(`请求参数:`, this.sanitizeData(requestConfig.params));
      }

      if (requestConfig.data) {
        console.error(`请求数据:`, this.sanitizeData(requestConfig.data));
      }
    }

    console.error(separator);
  }

  logWebSocketConnection(url: string, requestId: string): void {
    const timestamp = this.formatTimestamp();
    const separator = "=".repeat(80);

    console.log(separator);
    console.log(`[WEBSOCKET CONNECT] [${requestId}] ${timestamp}`);
    console.log(separator);
    console.log(`连接URL: ${url}`);
    console.log(separator);
  }

  logWebSocketMessage(message: any, requestId: string, direction: "SENT" | "RECEIVED"): void {
    const timestamp = this.formatTimestamp();
    const prefix = `[WEBSOCKET ${direction}]`;

    console.log(`${prefix} [${requestId}] ${timestamp}`);
    console.log(`消息内容:`, this.sanitizeData(message));
  }

  logWebSocketClose(requestId: string, code?: number, reason?: string): void {
    const timestamp = this.formatTimestamp();
    const separator = "=".repeat(80);

    console.log(separator);
    console.log(`[WEBSOCKET CLOSE] [${requestId}] ${timestamp}`);
    console.log(separator);
    if (code !== undefined) {
      console.log(`关闭代码: ${code}`);
    }
    if (reason) {
      console.log(`关闭原因: ${reason}`);
    }
    console.log(separator);
  }

  logResourceLoad(url: string, requestId: string, resourceType: string): void {
    const timestamp = this.formatTimestamp();
    const separator = "=".repeat(80);

    console.log(separator);
    console.log(`[RESOURCE LOAD] [${requestId}] ${timestamp}`);
    console.log(separator);
    console.log(`资源类型: ${resourceType}`);
    console.log(`资源URL: ${url}`);
    console.log(separator);
  }
}

export const networkLogger = NetworkLogger.getInstance();
export default networkLogger;
