import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchPipelineBuilder } from 'shared/utils';

import { Genre } from '../schemas/genre.schema';

@Injectable()
export class GenreRepository {
  constructor(@InjectModel(Genre.name) private genreRepo: Model<Genre>) {}

  async create(genreData: Partial<Genre>): Promise<Genre | null> {
    return await this.genreRepo.create(genreData);
  }

  async findAll(): Promise<Genre[] | []> {
    return this.genreRepo.find({ deleted: false }).select('_id name').lean().exec();
  }

  async update(id: string, genreData: Partial<Genre>): Promise<Genre | null> {
    return await this.genreRepo.findByIdAndUpdate(id, genreData, { new: true }).select('_id name').exec();
  }

  async delete(id: string, genreData: Partial<Genre>): Promise<Genre | null> {
    return this.genreRepo.findByIdAndUpdate(id, genreData, { new: true }).exec();
  }

  async getGenreNamesByGenreNames(genreNames: string[]): Promise<string[]> {
    if (!genreNames || genreNames.length === 0) return [];
    const genres = await this.genreRepo
      .find({ name: { $in: genreNames } })
      .select('name')
      .lean()
      .exec();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return genres.map((g: any) => g.name);
  }

  async searchByName(keyword: string, limit = 20): Promise<Genre[] | []> {
    if (!keyword?.trim()) return [];

    return this.genreRepo.aggregate(SearchPipelineBuilder.textSearch(keyword, { limit }));
  }
}
