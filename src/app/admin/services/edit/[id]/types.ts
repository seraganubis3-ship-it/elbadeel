export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
  active?: boolean;
}

export interface ServiceDocument {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  active?: boolean;
  showIf?: string;
}

export interface ServiceFieldOption {
  id: string;
  value: string;
  label: string;
  requiredDocs?: string[];
}

export interface ServiceField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  active?: boolean;
  showIf?: string;
  options: ServiceFieldOption[];
}
