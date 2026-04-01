import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { IUploadMediaInput } from 'shared/interfaces';
import * as streamifier from 'streamifier';
type NormalizedUploadResponse = UploadApiResponse & { duration?: number; durationMs?: number };

@Injectable()
export class CloudinaryService {
  async uploadMedia(file: IUploadMediaInput): Promise<NormalizedUploadResponse> {
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');
    const resourceType = isVideo || isAudio ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tuta_uploads',
          resource_type: resourceType // Tự chọn image hoặc video
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(new BadRequestException(error.message));
          if (!result) return reject(new BadRequestException('Empty upload response'));

          // normalize response: đảm bảo có duration (s) và durationMs (ms) nếu có
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const resAny = result as any;
          const normalized: NormalizedUploadResponse = { ...(result as UploadApiResponse) } as NormalizedUploadResponse;
          if (typeof resAny.duration === 'number') {
            normalized.duration = resAny.duration;
            normalized.durationMs = Math.round(resAny.duration * 1000);
          }
          resolve(normalized);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMany(files: IUploadMediaInput[]): Promise<NormalizedUploadResponse[]> {
    return Promise.all(files.map((file) => this.uploadMedia(file)));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
