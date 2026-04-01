import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryArtistVerificationDto } from '../dtos';

export const buildArtistVerificationFilterQuery = (keyword?: QueryArtistVerificationDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  const sort = buildSortTypeObject(keyword.sort);

  return { filter, sort };
};
