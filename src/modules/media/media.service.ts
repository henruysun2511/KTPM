/* eslint-disable no-empty */
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { CloudinaryService } from 'modules/cloudinary/cloudinary.service';

export type UploadedImage = { secure_url: string; public_id: string; duration: number };

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: CustomLogger
  ) {}

  /**
   * Upload buffer to cloud and attach via attachFn.
   * attachFn receives uploaded image info and should persist to DB.
   * If attachFn throws, uploaded image will be removed (best-effort rollback).
   */
  async uploadAndAttach(
    params: { buffer: Buffer; mimetype: string; originalname?: string },
    attachFn: (img: UploadedImage) => Promise<void>,
    job?: Job
  ): Promise<UploadedImage> {
    const { buffer, mimetype, originalname } = params;

    try {
      await job?.updateProgress?.(10).catch(() => {});
    } catch {}

    // upload
    const img = await this.cloudinaryService.uploadMedia({
      buffer,
      mimetype,
      originalname
    });

    try {
      await job?.updateProgress?.(70).catch(() => {});
    } catch {}

    // call attach callback (DB update etc.)
    try {
      await attachFn({ secure_url: img.secure_url, public_id: img.public_id, duration: img.duration });
    } catch (err) {
      // rollback uploaded image if DB update failed
      try {
        await this.cloudinaryService.deleteImage(img.public_id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (delErr: any) {
        this.logger.error(`Rollback delete failed for ${img.public_id}: ${delErr?.message}`);
      }
      throw err;
    } finally {
      // free heavy buffer ref if present on job
      try {
        if (job && job.data) job.data.buffer = null;
      } catch {}
    }

    try {
      await job?.updateProgress?.(100).catch(() => {});
    } catch {}

    return { secure_url: img.secure_url, public_id: img.public_id, duration: img.duration };
  }

  // ...existing code...
  async uploadManyAndAttach(
    params: { buffer: Buffer; mimetype: string; originalname?: string }[],
    attachFn: (img: UploadedImage[]) => Promise<void>,
    job?: Job
  ): Promise<UploadedImage[]> {
    try {
      await job?.updateProgress?.(10).catch(() => {});
    } catch {}

    // upload
    const imgs = await this.cloudinaryService.uploadMany(params);

    try {
      await job?.updateProgress?.(70).catch(() => {});
    } catch {}

    // call attach callback (DB update etc.)
    const uploadImgs: UploadedImage[] = imgs.map((img) => ({
      secure_url: img.secure_url,
      public_id: img.public_id,
      duration: img.duration
    }));

    try {
      await attachFn(uploadImgs);
    } catch (err) {
      // rollback uploaded images if DB update failed (best-effort)
      try {
        await Promise.allSettled(imgs.map((i) => this.cloudinaryService.deleteImage(i.public_id)));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (delErr: any) {
        this.logger.error(`Rollback delete failed: ${delErr?.message}`);
      }
      throw err;
    } finally {
      // free heavy buffer ref if present on job
      try {
        if (job && job.data) job.data.buffer = null;
      } catch {}
    }

    try {
      await job?.updateProgress?.(100).catch(() => {});
    } catch {}

    return uploadImgs;
  }
}
