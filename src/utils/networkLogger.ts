interface RequestConfig {
  method: string;
  url: string;
  params?: unknown;
  data?: unknown;
  headers?: Record<string, string | number | string[] | boolean>;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers?: Record<string, unknown>;
  data: unknown;
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

  sanitizeData(data: unknown, depth = 0): unknown {
    if (depth > 5) {
      return "[已达到最大深度]";
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

    const sanitized: Record<string, unknown> = {};
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

  private maskSensitiveValue(value: unknown): string {
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
      return str.substring(0, 500) + "...[已截断]";
    }
    return str;
  }

  logRequest(
    config: RequestConfig,
    requestId: string,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const prefix = `[${requestType} 请求]`;

    console.log(`${prefix} [${requestId}] ${config.method} ${config.url}`);

    if (config.params && Object.keys(config.params).length > 0) {
      const paramKeys = Object.keys(config.params).slice(0, 5).join(", ");
      const more =
        Object.keys(config.params).length > 5
          ? `...(+${Object.keys(config.params).length - 5})`
          : "";
      console.log(`  参数: ${paramKeys}${more}`);
    }

    if (config.data) {
      console.log(`  数据: [${typeof config.data === "object" ? "对象" : typeof config.data}]`);
    }
  }

  logResponse(
    response: ResponseData,
    requestId: string,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const prefix = `[${requestType} 响应]`;

    console.log(`${prefix} [${requestId}] ${response.status} ${response.statusText}`);

    if (response.data) {
      const dataType = Array.isArray(response.data)
        ? `数组(${response.data.length})`
        : typeof response.data;
      console.log(`  数据: [${dataType}]`);
    }
  }

  logError(
    error: ErrorInfo,
    requestConfig?: RequestConfig,
    requestType: "API" | "RESOURCE" | "WEBSOCKET" = "API"
  ): void {
    const prefix = `[${requestType} 错误]`;

    console.error(`${prefix} [${error.requestId}] ${error.type}: ${error.message}`);

    if (error.status !== undefined) {
      console.error(`  状态码: ${error.status}`);
    }

    if (requestConfig) {
      console.error(`  ${requestConfig.method} ${requestConfig.url}`);
    }
  }

  logWebSocketConnection(url: string, requestId: string): void {
    console.log(`[WebSocket 连接] [${requestId}] ${url}`);
  }

  logWebSocketMessage(message: unknown, requestId: string, direction: "SENT" | "RECEIVED"): void {
    const msgType = typeof message === "object" ? "对象" : typeof message;
    const directionText = direction === "SENT" ? "发送" : "接收";
    console.log(`[WebSocket ${directionText}] [${requestId}] [${msgType}]`);
  }

  logWebSocketClose(requestId: string, code?: number, reason?: string): void {
    const parts = [`[WebSocket 关闭] [${requestId}]`];
    if (code !== undefined) parts.push(`代码=${code}`);
    if (reason) parts.push(`原因=${reason}`);
    console.log(parts.join(" "));
  }

  logResourceLoad(url: string, requestId: string, resourceType: string): void {
    console.log(`[资源加载] [${requestId}] ${resourceType}: ${url}`);
  }
}

export const networkLogger = NetworkLogger.getInstance();
export default networkLogger;
