## Vidopi JS SDK

TypeScript/JavaScript SDK for the Vidopi video processing API.

### Installation

```bash
npm install vidopi-js
```

Requires **Node.js >= 18** (or any modern browser) with a global `fetch` and `FormData`.

### Basic Usage

```ts
import { VidopiClient } from 'vidopi-js';

const client = new VidopiClient({
  apiKey: process.env.VIDOPI_API_KEY!,
});

async function main() {
  // Example: upload a video (Node.js)
  const fs = await import('node:fs/promises');
  const fileBuffer = await fs.readFile('/path/to/video.mp4');

  const upload = await client.uploadVideo({
    file: fileBuffer,
    fileName: 'video.mp4',
  });

  console.log('Upload response:', upload);

  if (!upload.public_link) {
    throw new Error('No public_link returned from upload.');
  }

  // Example: cut a section of the uploaded video
  const cut = await client.cutVideo({
    publicLink: upload.public_link,
    startTime: 3,
    endTime: 5,
  });

  console.log('Cut response:', cut);

  if (!cut.task_id) {
    throw new Error('No task_id returned from cut request.');
  }

  // Example: check task status
  const status = await client.getTaskStatus(cut.task_id);
  console.log('Task status:', status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### API Surface

- **Authentication**
  - `new VidopiClient({ apiKey, baseUrl? })`
  - `client.testApiKey()`
- **Upload**
  - `client.uploadVideo(params: UploadVideoParams)`
- **Cut**
  - `client.cutVideo(params: CutVideoParams)`
- **Merge**
  - `client.mergeVideos(params: MergeVideosParams)`
- **Resize**
  - `client.resizeVideo(params: ResizeVideoParams)`
- **Task Status**
  - `client.getTaskStatus(taskId: string)`

All request/response types are exported from the root entrypoint.


# vidopi-js

