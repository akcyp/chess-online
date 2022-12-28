/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    API_URL: string;
    API_SECURE: boolean;
  }
}
