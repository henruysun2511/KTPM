import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ReplyComment } from '../schemas/reply-comment.schema';

export class ReplyCommentRepository {
  constructor(@InjectModel(ReplyComment.name) private replyCommentRepo: Model<ReplyComment>) {}

  async create(replyCommentData: Partial<ReplyComment>): Promise<ReplyComment> {
    return await this.replyCommentRepo.create(replyCommentData);
  }

  async countByCommentId(commentId: string) {
    return this.replyCommentRepo.countDocuments({
      commentId: commentId,
      deleted: false
    });
  }

  async findByCommentId(commentId: string, skip: number, limit: number) {
    return this.replyCommentRepo
      .find({
        commentId: commentId,
        deleted: false
      })
      .select('_id content userId createdAt')
      .populate('userId', '_id username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findById(id: string): Promise<ReplyComment | null> {
    return this.replyCommentRepo.findById(id).lean().exec();
  }

  //Sửa
  async update(id: string, replyCommentData: Partial<ReplyComment>): Promise<ReplyComment | null> {
    return await this.replyCommentRepo
      .findByIdAndUpdate(id, replyCommentData, { new: true })
      .select('_id content')
      .exec();
  }

  //Xóa
  async remove(id: string, userId: string): Promise<ReplyComment | null> {
    return this.replyCommentRepo
      .findByIdAndUpdate(id, { deleted: true, deletedAt: new Date(), deletedBy: userId }, { new: true })
      .exec();
  }
}
