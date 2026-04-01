import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryUserDto } from '../dtos';

export const buildUserFilterQuery = (keyword?: QueryUserDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.email) {
    filter.email = keyword.email;
  }

  if (keyword?.username && String(keyword.username).trim()) {
    filter.username = { $regex: String(keyword.username).trim(), $options: 'i' };
  }

  if (keyword.isPremium) {
    filter.isPremium = keyword.isPremium;
  }

  if (keyword.status) {
    filter.status = keyword.status;
  }

  if (keyword.roleName) {
    filter.roleName = keyword.roleName;
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
