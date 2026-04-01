// src/shared/search/search-pipeline.builder.ts
import { PipelineStage } from 'mongoose';

export class SearchPipelineBuilder {
  static textSearch(
    keyword: string,
    options?: {
      deletedField?: string;
      popularityField?: string; // độ nổi tiếng
      textWeight?: number; // nội dung
      popularityWeight?: number; // độ hot
      limit?: number;
    }
  ): PipelineStage[] {
    const {
      deletedField = 'deleted',
      popularityField = 'popularity',
      textWeight = 1.0,
      popularityWeight = 0.0,
      limit = 20
    } = options || {};

    return [
      {
        $match: {
          $text: { $search: keyword },
          [deletedField]: false
        }
      },
      {
        $addFields: {
          popularitySafe: { $ifNull: [`$${popularityField}`, 0] }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $meta: 'textScore' }, textWeight] },
              { $multiply: ['$popularitySafe', popularityWeight] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ];
  }
}
