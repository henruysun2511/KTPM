import { Controller, Post, UploadedFile } from '@nestjs/common';
import { MediaUploadInterceptor } from 'cores/upload.interceptor';

import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinaries')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  @Post('media')
  @MediaUploadInterceptor('media', 5) // (fieldName, maxCount, maxSizeMB)
  async uploadImages(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadMedia(file);
  }
}
