import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryProductDto } from '../dtos';

export const buildProductFilterQuery = (keyword?: QueryProductDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.name && String(keyword.name).trim()) {
    filter.name = { $regex: String(keyword.name).trim(), $options: 'i' };
  }

  if (keyword.start) {
    filter.start = keyword.start;
  }
  if (keyword.end) {
    filter.end = keyword.end;
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
