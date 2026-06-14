import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { RemiMediaAttachment } from "../domain/remiMessage.js";

const DEFAULT_MEDIA_DIR = "/tmp/remi-media";

export async function downloadAndStoreMedia(
  attachments: RemiMediaAttachment[],
  mediaDir = DEFAULT_MEDIA_DIR
): Promise<RemiMediaAttachment[]> {
  await mkdir(mediaDir, { recursive: true });

  return Promise.all(attachments.map(async (attachment) => {
    const response = await fetch(attachment.sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to download media ${attachment.sourceUrl}: ${response.status} ${response.statusText}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const fileName = basename(new URL(attachment.storedUrl).pathname);
    const localPath = join(mediaDir, fileName);
    await writeFile(localPath, bytes);

    return {
      ...attachment,
      localPath,
      downloadedAt: Date.now(),
      contentType: attachment.contentType ?? response.headers.get("content-type") ?? undefined,
      size: attachment.size ?? bytes.length
    };
  }));
}
