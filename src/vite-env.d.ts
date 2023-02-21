/// <reference types="vite/client" />

import { Data } from './App.vue';

export type StatusDownload = {
  status: string;
  percent: number;
};

export interface IElectronAPI {
  loadPreferences: () => Promise<void>,
  selectFolder: () => void,
  startDownload: (files: Data['files'], path: Data['selectedPath']) => void,

  log: (callback: (event: any, data: any[]) => void) => void,
  onProgress: (callback: (event: any, statusList: StatusDownload[]) => void) => void
  onFinish: (callback: (event: any, statusList: StatusDownload[]) => void) => void
  onSelectFolder: (callback: (event: any, selectedPath: string) => void) => void
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
