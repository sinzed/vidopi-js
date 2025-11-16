import {
  CutVideoParams,
  CutVideoResponse,
  MergeVideoResponse,
  MergeVideosParams,
  ResizeVideoParams,
  ResizeVideoResponse,
  TaskStatusResponse,
  UploadVideoParams,
  UploadVideoResponse,
  VidopiClientOptions,
} from './types';

const DEFAULT_BASE_URL = 'https://api.vidopi.com';
const DEFAULT_CONTENT_TYPE = 'video/mp4';

export class VidopiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: VidopiClientOptions) {
    if (!options?.apiKey) {
      throw new Error('VidopiClient: "apiKey" is required.');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  /**
   * Low-level helper for making HTTP requests to the Vidopi API.
   */
  private async request<TResponse>(
    path: string,
    init: RequestInit & { query?: Record<string, string | number | boolean | undefined> } = {},
  ): Promise<TResponse> {
    const url = new URL(this.baseUrl + path);

    if (init.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      ...(init.headers ?? {}),
    };

    const requestInit: RequestInit = {
      ...init,
      headers,
    };

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      const message =
        typeof errorBody === 'object' && errorBody !== null
          ? JSON.stringify(errorBody)
          : String(errorBody || response.statusText);

      throw new Error(`Vidopi API request failed (${response.status}): ${message}`);
    }

    // Try to parse JSON, fall back to text
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as TResponse;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (await response.text()) as any;
    return text as TResponse;
  }

  /**
   * Simple API key validation helper. Calls /apikey-test.
   */
  async testApiKey(): Promise<unknown> {
    return this.request('/apikey-test', { method: 'GET' });
  }

  /**
   * Upload a video file to Vidopi for processing.
   * This wraps POST /upload-video/ with multipart/form-data.
   */
  async uploadVideo(params: UploadVideoParams): Promise<UploadVideoResponse> {
    const { file, fileName = 'video.mp4', contentType = DEFAULT_CONTENT_TYPE } = params;

    // FormData is available in modern Node (>=18) and browsers.
    const formData = new FormData();
    const name = fileName || 'video.mp4';

    // The types for FormData.append differ between environments, so we relax typing a bit here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formFile: any = file;
    formData.append('file', formFile, (formFile && formFile.name) || name);

    const response = await this.request<UploadVideoResponse>('/upload-video/', {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch set the multipart boundary automatically
        'X-Content-Type': contentType,
      },
    });

    return response;
  }

  /**
   * Request a cut operation on a public video link.
   * Wraps POST /cut-video/.
   */
  async cutVideo(params: CutVideoParams): Promise<CutVideoResponse> {
    const body = {
      public_link: params.publicLink,
      start_time: params.startTime,
      end_time: params.endTime,
      webhook_url: params.webhookUrl,
    };

    return this.request<CutVideoResponse>('/cut-video/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Merge two videos into a single output.
   * Wraps POST /merge-video/.
   */
  async mergeVideos(params: MergeVideosParams): Promise<MergeVideoResponse> {
    const body = {
      public_link_1: params.publicLink1,
      public_link_2: params.publicLink2,
      webhook_url: params.webhookUrl,
    };

    return this.request<MergeVideoResponse>('/merge-video/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Resize a video by specifying dimensions and optional extra options.
   * Wraps POST /resize-video/.
   */
  async resizeVideo(params: ResizeVideoParams): Promise<ResizeVideoResponse> {
    const body: Record<string, unknown> = {
      public_link: params.publicLink,
      webhook_url: params.webhookUrl,
    };

    if (params.width !== undefined) {
      body.width = params.width;
    }
    if (params.height !== undefined) {
      body.height = params.height;
    }
    if (params.maintainAspectRatio !== undefined) {
      body.maintain_aspect_ratio = params.maintainAspectRatio;
    }
    if (params.outputFormat !== undefined) {
      body.output_format = params.outputFormat;
    }

    return this.request<ResizeVideoResponse>('/resize-video/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Fetch status for an asynchronous processing task.
   * Wraps GET /task-status/{taskId}.
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    if (!taskId) {
      throw new Error('VidopiClient.getTaskStatus: "taskId" is required.');
    }

    return this.request<TaskStatusResponse>(`/task-status/${encodeURIComponent(taskId)}`, {
      method: 'GET',
    });
  }
}


