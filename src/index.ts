import {
  BuildFieldStructure,
  BuildFieldType,
  BuildPattern,
  BuildStructure,
  generateFilterDateRange,
  generateFilterList,
  generateFilterSearch,
  generateSearchFields,
  Query,
  QueryBuilder,
  QueryGenerator,
} from './utils';

export class MongooseQueryBuilder {
  static #queryGenerator: QueryGenerator = {};

  static register(structure: BuildStructure): string[] {
    const queryFields = [];
    const buildSearchFields = generateSearchFields(structure.fields);
    structure.fields.forEach((field: BuildFieldStructure) => {
      if (field.patterns.includes(BuildPattern.EXACT_LIST)) {
        const queryName =
          structure.model + '_' + field.name.trim().replace(/[.]/g, '_');
        queryFields.push(queryName);
        this.#queryGenerator[queryName] = (filters: any[], value: string[]) => {
          const q =
            field.type === BuildFieldType.BOOLEAN
              ? value[0] === '1' || value[0] === 'true'
              : field.type === BuildFieldType.DATE
              ? { $lte: new Date(value[0]) }
              : { $in: generateFilterList(field, value) };
          filters.push({ [field.name]: q });
        };
      } else if (
        field.patterns.includes(BuildPattern.DATE_RANGE) &&
        field.type === BuildFieldType.DATE
      ) {
        const queryName =
          structure.model +
          '_' +
          field.name.trim().replace(/[.]/g, '_') +
          '_date_range';
        queryFields.push(queryName);
        this.#queryGenerator[queryName] = (filters: any[], value: string[]) => {
          filters.push({
            [field.name]: generateFilterDateRange(value),
          });
        };
      }
    });

    if (buildSearchFields.length > 0) {
      const queryName = structure.model + '_search';
      queryFields.push(queryName);
      this.#queryGenerator[queryName] = (filters: any[], value: string[]) => {
        filters.push({ $or: generateFilterSearch(buildSearchFields, value) });
      };
    }
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
