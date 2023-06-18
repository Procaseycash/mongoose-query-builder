import { Types } from 'mongoose';
import * as dateFns from 'date-fns';
import {
  BuildFieldStructure,
  BuildFieldType,
  BuildPattern,
  BuildStructure,
  QueryGenerator,
  SearchFieldType,
} from './type';

export const generateFilterSearch = (
  searchFields: SearchFieldType[],
  value: string[],
) => {
  return searchFields
    .map(({ key, type }) =>
      value.map((s) => {
        const numSearch = parseFloat(s) ? { [key]: +s } : [];
        const strSearch = {
          [key]: {
            $regex: decodeURIComponent(s),
            $options: 'i',
          },
        };
        return type === 'number' ? numSearch : strSearch;
      }),
    )
    .flat(Infinity);
};

export const generateFilterList = (
  field: BuildFieldStructure,
  value: string[],
) => {
  return value
    .map((v) =>
      field.type === BuildFieldType.NUMBER
        ? parseFloat(v)
        : field.type === BuildFieldType.OBJECT_ID
        ? new Types.ObjectId(v)
        : v,
    )
    .filter((v) => !!v);
};

export const generateSearchFields = (fields: BuildFieldStructure[]) => {
  return fields
    .filter(
      (f) =>
        f.patterns.includes(BuildPattern.SEARCH) &&
        [BuildFieldType.STRING, BuildFieldType.NUMBER].includes(f.type),
    )
    .map((f) => ({ key: f.name, type: f.type }));
};

export const generateFilterDateRange = (value: string[]) => {
  const startDate = dateFns.startOfDay(new Date(value[0]));
  const endDate = dateFns.endOfDay(new Date(value[1]));
  if (
    value.length === 2 &&
    startDate.toISOString().localeCompare(endDate.toISOString()) === -1
  ) {
    const dateQuery = { $gte: startDate, $lte: endDate };
    return dateQuery;
  } else {
    throw new Error('The first date must be lower than the second date.');
  }
};

export const toSnakeCase = (camelCaseString: string) => {
  return camelCaseString.replace(
    /[A-Z]/g,
    (match) => '_' + match.toLowerCase(),
  );
};

export const getQueryName = (
  model: string,
  fieldName: string,
  otherSuffix: string = '',
) => {
  return (
    toSnakeCase(model) +
    '_' +
    toSnakeCase(fieldName.trim().replace(/[.]/g, '_')) +
    otherSuffix
  );
};

export const addExactListDateRangePattern = (
  queryGenerator: QueryGenerator,
  structure: BuildStructure,
  queryFields: string[],
) => {
  structure.fields.forEach((field: BuildFieldStructure) => {
    if (field.patterns.includes(BuildPattern.EXACT_LIST)) {
      const queryName = getQueryName(structure.model, field.name);
      queryFields.push(queryName);
      queryGenerator[queryName] = (filters: any[], value: string[]) => {
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
      const queryName = getQueryName(
        structure.model,
        field.name,
        '_date_range',
      );
      queryFields.push(queryName);
      queryGenerator[queryName] = (filters: any[], value: string[]) => {
        filters.push({
          [field.name]: generateFilterDateRange(value),
        });
      };
    }
  });
};

export const addSearchPattern = (
  queryGenerator: QueryGenerator,
  structure: BuildStructure,
  queryFields: string[],
) => {
  const buildSearchFields = generateSearchFields(structure.fields);
  if (buildSearchFields.length > 0) {
    const queryName = getQueryName(structure.model, 'search');
    queryFields.push(queryName);
    queryGenerator[queryName] = (filters: any[], value: string[]) => {
      filters.push({ $or: generateFilterSearch(buildSearchFields, value) });
    };
  }
};
