export type FieldBase = {
    id: string;
    key:string;
    type: FieldType;
    label: string;
    placeholder?: string;
    helpText?: string;
    required?: boolean;
    defaultValue?: any;
    validation?: {
    regex?: string;
    min?: number;
    max?: number;
    };
    visibleWhen?: string; // expression
    computed?: string; // expression
    };
    
    
    export type FieldType =
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "date"
    | "checkbox"
    | "radio"
    | "section"
    | "array";
    
    
    export type SelectOption = { value: string; label: string };
    export type SelectField = FieldBase & { type: "select" | "multiselect"; options: SelectOption[] };
    export type SectionField = FieldBase & { type: "section"; children: Field[] };
    export type ArrayField = FieldBase & { type: "array"; of: Field };
    export type Field = FieldBase | SelectField | SectionField | ArrayField;
    
    
    export type Schema = { version: 1; fields: Field[] };