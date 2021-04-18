export type FieldValue = string | number | boolean | string[] | object;

export type FormValues = Record<string, FieldValue>;

export interface FormRefType {
  values?: FormValues;
}

export type CheckMode = "input" | "blur" | "submit";

export type Rules = Record<string, Rule[]>;

export interface RangeMinRule {
  min: number;
  message: string;
}

export interface RangeMaxRule {
  max: number;
  message: string;
}

export interface RangeMinLengthRule {
  minLength: number;
  message: string;
}

export interface RangeMaxLengthRule {
  maxLength: number;
  message: string;
}

export interface RequireRule {
  required: boolean;
  message: string;
}

export type ErrorsType = Record<string, string | boolean>;

export interface PatternRule {
  // eslint-disable-next-line
  pattern: RegExp | ((value: any) => boolean);
  message: string;
}

export type Rule =
  | RequireRule
  | PatternRule
  | RangeMinRule
  | RangeMaxRule
  | RangeMinLengthRule
  | RangeMaxLengthRule;

export type Remove<T, K> = {
  [P in Exclude<keyof T, K>]: T[P];
};
