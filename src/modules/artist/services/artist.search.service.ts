import { Injectable } from '@nestjs/common';

import { ArtistRepository } from '../repositories/artist.repository';

@Injectable()
export class ArtistSearchService {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async search(keyword: string) {
    return await this.artistRepo.searchByName(keyword, 10);
  }
}
