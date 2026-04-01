import { buildSortTypeObject } from 'shared/utils/buildSort.util';
import { buildDateRange } from 'shared/utils/buildDateRange.util';

import { QueryAlbumDto } from '../dto';

export const buildAlbumFilterQuery = (keyword?: QueryAlbumDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.title && String(keyword.title).trim()) {
    filter.title = { $regex: String(keyword.title).trim(), $options: 'i' };
  }

  if (keyword.releaseDate) {
    const { start, end } = buildDateRange(keyword.releaseDate);
    filter.start = start;
    filter.end = end;
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
