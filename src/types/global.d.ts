 
export {};

declare global {
  interface Window {
    showErrorModal?: (
      _message: string,
      _details?: Record<string, unknown>,
      _retry?: () => Promise<void>,
      _code?: number
    ) => void;
  }
}
