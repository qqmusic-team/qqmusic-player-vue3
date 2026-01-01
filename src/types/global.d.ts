export {};

declare global {
  interface Window {
    showErrorModal?: (message: string, details?: any, retry?: () => Promise<void>, code?: number) => void;
  }
}
