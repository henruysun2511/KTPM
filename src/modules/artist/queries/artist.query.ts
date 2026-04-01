import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryArtistDto } from '../dtos';

export const buildArtistFilterQuery = (keyword?: QueryArtistDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.country && String(keyword.country).trim()) {
    filter.country = { $regex: String(keyword.country).trim(), $options: 'i' };
  }

  if (keyword?.name && String(keyword.name).trim()) {
    filter.name = { $regex: String(keyword.name).trim(), $options: 'i' };
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
