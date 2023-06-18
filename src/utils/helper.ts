import { Types } from 'mongoose';
import * as dateFns from 'date-fns';
import {
  BuildFieldStructure,
  BuildFieldType,
  BuildPattern,
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

export const getQueryName = (model: string, fieldName: string, otherSuffix: string = '') => {
  return (
    toSnakeCase(model) +
    '_' +
    toSnakeCase(fieldName.trim().replace(/[.]/g, '_')) +
    otherSuffix
  );
};
