export const paginate = async (
  model,
  req,
  customWhere = {},
  customOrderBy = {
    created_at: "desc",
  },
  customSelect = {},
  defaultLimit = 10,
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || defaultLimit;
  const offset = (page - 1) * limit;

  if (limit <= 0 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  if (page <= 0) {
    throw new Error("Page must be greater than 0");
  }

  const totalItems = await model.count({ where: customWhere });
  const items = await model.findMany({
    skip: offset,
    take: limit,
    where: customWhere,
    orderBy: customOrderBy,
    select: customSelect,
  });

  const totalPage = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPage;
  const hasPrevPage = page > 1;

  return {
    data: items,
    pagination: {
      page: page,
      limit: limit,
      totalItems: totalItems,
      totalPage: totalPage,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
    },
  };
};
