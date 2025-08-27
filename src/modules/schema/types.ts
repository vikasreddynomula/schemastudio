export type FieldType =
  | "text" | "number" | "date" | "checkbox"
  | "select" | "multiselect" | "radio"
  | "section" | "array";

export type FieldBase = {
  id: string;
  key: string;              // form name
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: { regex?: string; min?: number; max?: number };
  visibleWhen?: string;     // expression
  computed?: string;        // expression
};

export type SelectOption = { value: string; label: string };
export type SelectField = FieldBase & {
  type: "select" | "multiselect" | "radio";
  options: SelectOption[];
};
export type SectionField = FieldBase & {
  type: "section";
  children: Field[];
};
export type ArrayField = FieldBase & {
  type: "array";
  of: Exclude<Field, SectionField | ArrayField>; 
};

export type Field = FieldBase | SelectField | SectionField | ArrayField;
export type Schema = { version: 1; fields: Field[] };
