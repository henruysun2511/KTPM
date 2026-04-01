import { Injectable } from '@nestjs/common';
import { IUserRequest } from 'shared/interfaces';

import { GenreRepository } from '../repositories/genre.repository';
import { CreateGenreDto, UpdateGenreDto } from '../dtos';

@Injectable()
export class GenreService {
  constructor(private readonly genreRepo: GenreRepository) {}

  async createGenre(createGenreDto: CreateGenreDto, user: IUserRequest) {
    return await this.genreRepo.create({
      ...createGenreDto,
      createdBy: user.userId
    });
  }

  async findAllGenres() {
    return await this.genreRepo.findAll();
  }

  async updateGenre(id: string, updateGenreDto: UpdateGenreDto, user: IUserRequest) {
    return await this.genreRepo.update(id, { ...updateGenreDto, updatedBy: user.userId });
  }

  async getGenreNamesByGenreNames(genreNames: string[]) {
    return await this.genreRepo.getGenreNamesByGenreNames(genreNames);
  }
}
