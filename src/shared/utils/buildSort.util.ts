function buildSortTypeObject(sort?: string, allowedFields: string[] = []): Record<string, 1 | -1> {
  if (!sort) return { createdAt: -1 }; // mặc định mới nhất

  let field = sort;
  let direction: 1 | -1 = 1; // mặc định ASC

  // Nếu truyền "-createdAt" -> DESC
  if (sort.startsWith('-')) {
    field = sort.substring(1);
    direction = -1;
  }

  // Nếu truyền "createdAt:desc" hoặc "createdAt:asc"
  // if (sort.includes(':')) {
  //   const [f, dir] = sort.split(':');
  //   field = f;
  //   direction = dir.toLowerCase() === 'desc' ? -1 : 1;
  // }

  // Chỉ cho phép sort theo field nằm trong danh sách allowedFields

  if (allowedFields.length === 0 && !allowedFields.includes(field)) {
    return { createdAt: -1 }; // fallback an toàn
  }

  return { [field]: direction };
}

export { buildSortTypeObject };
