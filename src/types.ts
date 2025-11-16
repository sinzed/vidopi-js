export type VidopiTaskStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface VidopiClientOptions {
  /**
   * Vidopi API key. You can obtain one from https://vidopi.com.
   */
  apiKey: string;

  /**
   * Override the default Vidopi API base URL (https://api.vidopi.com).
   */
  baseUrl?: string;
}

export interface UploadVideoResponse {
  task_id?: string;
  status?: VidopiTaskStatus;
  public_link?: string;
  [key: string]: unknown;
}

export interface CutVideoResponse {
  task_id?: string;
  status?: VidopiTaskStatus;
  download_url?: string;
  [key: string]: unknown;
}

export interface MergeVideoResponse {
  task_id?: string;
  status?: VidopiTaskStatus;
  download_url?: string;
  [key: string]: unknown;
}

export interface ResizeVideoResponse {
  task_id?: string;
  status?: VidopiTaskStatus;
  download_url?: string;
  [key: string]: unknown;
}

export interface TaskStatusErrorResult {
  error?: unknown;
  [key: string]: unknown;
}

export interface TaskStatusResponse {
  status: VidopiTaskStatus;
  result?: TaskStatusErrorResult | null;
  download_url?: string;
  [key: string]: unknown;
}

export interface UploadVideoParams {
  /**
   * File contents to upload. Works with Buffer (Node.js), Blob/File (browser),
   * ArrayBuffer, or Uint8Array.
   */
  file: Blob | File | Buffer | ArrayBuffer | Uint8Array;

  /**
   * Optional file name. Defaults to "video.mp4".
   */
  fileName?: string;

  /**
   * Optional MIME type for the file. Defaults to "video/mp4".
   */
  contentType?: string;
}

export interface CutVideoParams {
  publicLink: string;
  startTime: number;
  endTime: number;
  webhookUrl?: string;
}

export interface MergeVideosParams {
  publicLink1: string;
  publicLink2: string;
  webhookUrl?: string;
}

export interface ResizeVideoParams {
  publicLink: string;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  outputFormat?: string;
  webhookUrl?: string;
}



