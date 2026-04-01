import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryAdvertisementDto } from '../dtos';

export const buildAdsFilterQuery = (keyword?: QueryAdvertisementDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword?.title && String(keyword.title).trim()) {
    filter.title = { $regex: String(keyword.title).trim(), $options: 'i' };
  }

  if (typeof keyword.isActived === 'boolean') {
    filter.isActived = keyword.isActived;
  }

  const sort = buildSortTypeObject(keyword?.sort);

  return { filter, sort };
};
