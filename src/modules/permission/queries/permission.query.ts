import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryPermissionDto } from '../dtos';

export const buildPermissionFilterQuery = (keyword?: QueryPermissionDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.name && String(keyword.name).trim()) {
    filter.name = { $regex: String(keyword.name).trim(), $options: 'i' };
  }

  if (keyword.method && String(keyword.method).trim()) {
    filter.method = keyword.method.trim().toUpperCase();
  }

  if (keyword.module && String(keyword.module).trim()) {
    filter.module = keyword.module.trim().toUpperCase();
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
