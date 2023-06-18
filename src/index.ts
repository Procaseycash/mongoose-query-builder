import {
  BuildStructure,
  addExactListDateRangePattern,
  addSearchPattern,
  Query,
  QueryBuilder,
  QueryGenerator,
} from './utils';

export class MongooseQueryBuilder {
  static #queryGenerator: QueryGenerator = {};

  static register(structure: BuildStructure): string[] {
    const queryFields = [];
    addExactListDateRangePattern(this.#queryGenerator, structure, queryFields);
    addSearchPattern(this.#queryGenerator, structure, queryFields);
    return queryFields;
  }

  static registerList(structures: BuildStructure[]): string[] {
    return structures
      .map((structure) => this.register(structure))
      .flat(Infinity) as string[];
  }

  static generate(query: Query, delimiter: string = ','): QueryBuilder {
    const filters: any[] = [];
    const dbQueryFields: string[] = [];

    for (const key in query) {
      if (!query.hasOwnProperty(key)) continue;

      let value = query[key] || '';

      if (!value) continue;

      const valueList = value
        .split(new RegExp(`[${delimiter}]`, 'gi'))
        .filter((s: string) => !!s)
        .map((s: string) => s.trim());

      if (!!this.#queryGenerator[key]) {
        dbQueryFields.push(key);
        this.#queryGenerator[key](filters, valueList);
      }
    }

    const dbQuery = filters.length > 0 ? { $and: filters } : {};

    return { dbQuery, dbQueryFields };
  }
}
