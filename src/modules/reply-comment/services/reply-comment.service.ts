import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';

import { ReplyCommentRepository } from '../repositories/reply-comment.repository';
import { CreateReplyCommentDto, UpdateReplyCommentDto } from '../dtos';

@Injectable()
export class ReplyCommentService {
  constructor(private readonly replyCommentRepo: ReplyCommentRepository) {}

  async create(replyCommentDto: CreateReplyCommentDto, user: Partial<IUserRequest>) {
    return await this.replyCommentRepo.create({ ...replyCommentDto, userId: user.userId });
  }

  // async findAllReplyCommentsByCommentId(commentId: string, query: { page?: number; limit?: number }) {
  //   const page = Number(query.page) || 1;
  //   const limit = Number(query.limit) || 10;
  //   const skip = (page - 1) * limit;

  //   const totalItems = await this.replyCommentRepo.countByCommentId(commentId);
  //   const totalPages = Math.ceil(totalItems / limit);

  //   const data = await this.replyCommentRepo.findByCommentId(commentId, skip, limit);

  //   return {
  //     data,
  //     pagination: {
  //       page,
  //       limit,
  //       totalItems,
  //       totalPages
  //     }
  //   };
  // }

  async update(id: string, replyCommentDto: UpdateReplyCommentDto, user: Partial<IUserRequest>) {
    await this.assertIsOwner(id, user.userId);
    return await this.replyCommentRepo.update(id, {
      content: replyCommentDto.content
    });
  }

  async remove(id: string, user: Partial<IUserRequest>) {
    await this.assertIsOwner(id, user.userId);

    return await this.replyCommentRepo.remove(id, user.userId);
  }

  private async assertIsOwner(id: string, userId: string) {
    const reply = await this.replyCommentRepo.findById(id);

    if (!reply) throw new NotFoundException('Không tìm thấy bình luận');

    if (String(reply.userId) !== userId) {
      throw new ForbiddenException('Không thể sửa bình luận của người khác');
    }
  }
}
