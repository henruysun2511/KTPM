import { buildSortTypeObject } from 'shared/utils/buildSort.util';

import { QueryReportDto } from '../dtos/query-report.dto';

export const buildReportFilterQuery = (keyword: QueryReportDto) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (keyword.targetType) {
    filter.targetType = keyword.targetType;
  }

  const sort = buildSortTypeObject(keyword.sort);

  return { filter, sort };
};
