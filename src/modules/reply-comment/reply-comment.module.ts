import { Module } from '@nestjs/common';

import { ReplyCommentService } from './services/reply-comment.service';
import { ReplyCommentController } from './controllers/reply-comment.controller';

@Module({
  controllers: [ReplyCommentController],
  providers: [ReplyCommentService]
})
export class ReplyCommentModule {}
