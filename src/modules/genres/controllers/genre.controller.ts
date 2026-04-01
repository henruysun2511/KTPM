import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Public, User } from 'shared/decorators/customize';
import { IUserRequest } from 'shared/interfaces';

import { GenreService } from '../services/genre.service';
import { CreateGenreDto, UpdateGenreDto } from '../dtos';

@Controller('genres')
export class GenresController {
  constructor(private readonly genreService: GenreService) {}
  @Post()
  create(@Body() createGenreDto: CreateGenreDto, @User() user: IUserRequest) {
    return this.genreService.createGenre(createGenreDto, user);
  }

  @Public()
  @Get('')
  findAll() {
    return this.genreService.findAllGenres();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto, @User() user: IUserRequest) {
    return this.genreService.updateGenre(id, updateGenreDto, user);
  }
}
