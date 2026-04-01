import { UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

export function MediaUploadInterceptor(fieldName = 'media', maxSizeMB = 50) {
  return UseInterceptors(
    FileInterceptor(fieldName, {
      limits: {
        fileSize: maxSizeMB * 1024 * 1024
      },
      fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const isAudio = file.mimetype.startsWith('audio/');

        if (!isImage && !isVideo && !isAudio) {
          return cb(new BadRequestException('Chỉ được upload ảnh, video hoặc audio hợp lệ!'), false);
        }
        cb(null, true);
      }
    })
  );
}

export function MultiMediaUploadInterceptor(
  fields: { name: string; maxCount?: number }[] = [
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ],
  maxSizeMB = 50
) {
  return UseInterceptors(
    FileFieldsInterceptor(fields, {
      limits: {
        fileSize: maxSizeMB * 1024 * 1024
      },
      fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const isAudio = file.mimetype.startsWith('audio/');

        if (!isImage && !isVideo && !isAudio) {
          return cb(new BadRequestException('Chỉ được upload ảnh, video hoặc audio hợp lệ!'), false);
        }
        cb(null, true);
      }
    })
  );
}
