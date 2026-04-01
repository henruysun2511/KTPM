import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryNewsDto } from '../dtos';

export const buildNewsFilterQuery = (query?: QueryNewsDto) => {
  const filter: Record<string, any> = { deleted: false };

  // Sử dụng regex và trim() đồng bộ với artist.query.ts
  if (query?.title && String(query.title).trim()) {
    filter.title = { $regex: String(query.title).trim(), $options: 'i' };
  }

  if (query?.status) {
    filter.status = query.status;
  }

  const sort = buildSortTypeObject(query?.sort);

  return { filter, sort };
};
