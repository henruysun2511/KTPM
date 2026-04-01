import { Injectable } from '@nestjs/common';

import { GenreRepository } from '../repositories/genre.repository';

@Injectable()
export class GenreSearchService {
  constructor(private readonly genreRepo: GenreRepository) {}

  async search(keyword: string) {
    return await this.genreRepo.searchByName(keyword, 10);
  }
}
