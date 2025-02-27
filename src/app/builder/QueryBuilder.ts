import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.search as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" }
            } as FilterQuery<T>)
        )
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      "search",
      "sort",
      "limit",
      "page",
      "fields",
      "priceRange",
      "availability",
      "brand",
      "model"
    ];
    excludeFields.forEach((field) => delete queryObj[field]);

    for (const key in queryObj) {
      if (Array.isArray(queryObj[key])) {
        queryObj[key] = { $in: queryObj[key] };
      }
    }

    // Handle price range filter
    if (this.query.priceRange) {
      const [min, max] = (this.query.priceRange as string)
        .split("-")
        .map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        queryObj["price"] = { $gte: min, $lte: max };
      }
    }

    if (this.query.availability) {
      if (this.query.availability === "Out of Stock") {
        queryObj["stock"] = false;
      } else if (this.query.availability === "In Stock") {
        queryObj["stock"] = true;
      }
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this.query.sort as string)?.split(",")?.join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 100;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query.fields as string)?.split(",")?.join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage
    };
  }
}

export default QueryBuilder;
