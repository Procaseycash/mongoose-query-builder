import { Types } from 'mongoose';
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

