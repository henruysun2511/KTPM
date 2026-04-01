import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from 'modules/queue/queue.module';
import { RoleModule } from 'modules/role/role.module';
import { UserModule } from 'modules/user/user.module';
import { ArtistModule } from 'modules/artist/artist.module';

import { ArtistVerificationService } from './services/artist-verification.service';
import { ArtistVerificationController } from './controllers/artist-verification.controller';
import { ArtistVerification, ArtistVerificationSchema } from './schemas/artist-verification.schema';
import { ArtistVerificationRepository } from './repositories/artist-verification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ArtistVerification.name, schema: ArtistVerificationSchema }]),
    forwardRef(() => QueueModule),
    forwardRef(() => UserModule),
    ArtistModule,
    RoleModule
  ],
  controllers: [ArtistVerificationController],
  providers: [ArtistVerificationService, ArtistVerificationRepository],
  exports: [ArtistVerificationService]
})
export class ArtistVerificationModule {}
