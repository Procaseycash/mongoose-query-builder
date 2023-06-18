export type SearchFieldType = {
  key: string;
  type?: string;
};

export enum BuildPattern {
  EXACT_LIST = 'EXACT_LIST',
  SEARCH = 'SEARCH',
  DATE_RANGE = 'DATE_RANGE',
}

export enum BuildFieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  OBJECT_ID = 'objectId',
}

export type BuildFieldStructure = {
  name: string;
  type: BuildFieldType;
  patterns: BuildPattern[];
};

export type BuildStructure = {
  model: string;
  fields: BuildFieldStructure[];
};

export type Query = {
  [key: string]: string;
};

export type QueryBuilder = {
  dbQuery: any;
  dbQueryFields: string[];
};

export type QueryGenerator = {
  [field: string]: (filters: any[], value: string[]) => void;
};
