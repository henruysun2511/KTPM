import { Expose } from 'class-transformer';
import { ExposeId } from 'shared/decorators/customize';

export class SongResponseDto {
  @ExposeId()
  _id?: string;

  @ExposeId()
  artistId: string;

  @Expose()
  name: string;

  @Expose()
  explicit: boolean;

  @Expose()
  imageUrl?: string;

  @Expose()
  mp3Link?: string;

  @Expose()
  genreNames: string[];

  @Expose()
  albumId?: string;

  @Expose()
  featArtistIds?: string[];

  @Expose()
  releaseAt?: Date;

  @Expose()
  releseStatus: string;
}
