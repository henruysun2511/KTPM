import { PartialType } from '@nestjs/mapped-types';

import { CreateReplyCommentDto } from './create-reply-comment.dto';

export class UpdateReplyCommentDto extends PartialType(CreateReplyCommentDto) {}
