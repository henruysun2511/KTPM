import { buildSortTypeObject } from 'shared/utils/buildSort.util';
import { Types } from 'mongoose';

import { QuerySongDto, QuerySongDtoForClient } from '../dtos';

export const buildSongFilterQuery = (keyword: QuerySongDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword.genreNames && Array.isArray(keyword.genreNames) && keyword.genreNames.length) {
    filter.genreNames = { $in: keyword.genreNames };
  }

  if (keyword.name && String(keyword.name).trim()) {
    filter.name = { $regex: String(keyword.name).trim(), $options: 'i' };
  }

  if (keyword.artistId) {
    filter.createdBy = new Types.ObjectId(keyword.artistId);
  }

  const sort = buildSortTypeObject(keyword.sort);

  return { filter, sort };
};
export const buildSongFilterQueryForClient = (keyword: QuerySongDtoForClient) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (keyword.genreNames && Array.isArray(keyword.genreNames) && keyword.genreNames.length) {
    filter.genreNames = { $in: keyword.genreNames };
  }
  return filter;
};
