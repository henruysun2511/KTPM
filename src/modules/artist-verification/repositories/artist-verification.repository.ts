import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

import { ArtistVerification } from '../schemas/artist-verification.schema';

@Injectable()
export class ArtistVerificationRepository {
  constructor(
    @InjectModel(ArtistVerification.name) private readonly artistVerificationRepo: Model<ArtistVerification>
  ) {}

  async create(artistVerificationData: Partial<ArtistVerification>): Promise<ArtistVerification> {
    return await this.artistVerificationRepo.create(artistVerificationData);
  }

  async updateIndentity(
    id: string,
    identityImages: { front: string; back: string }
  ): Promise<ArtistVerification | null> {
    return await this.artistVerificationRepo.findByIdAndUpdate(id, { $set: { identityImages } }, { new: true }).exec();
  }

  async update(
    _id: string,
    artistVerificationData: Partial<ArtistVerification>,
    session?: ClientSession
  ): Promise<ArtistVerification | null> {
    return await this.artistVerificationRepo
      .findByIdAndUpdate(_id, { $set: artistVerificationData }, { new: true, session })
      .exec();
  }

  async findAll(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: Record<string, any>,
    skip: number,
    size: number,
    sort: Record<string, 1 | -1>,
    select?: string | string[]
  ): Promise<ArtistVerification[] | []> {
    const verifications = this.artistVerificationRepo
      .find({ deleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(size);

    if (select) verifications.select(select);
    verifications.populate('userId', 'username').lean();
    return await verifications.exec();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async countDocuments(filter: Record<string, any>): Promise<number> {
    return await this.artistVerificationRepo.countDocuments(filter);
  }
}
