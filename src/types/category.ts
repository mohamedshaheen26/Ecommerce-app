export interface ICategory {
  id?: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface ICategoryValidation {
  name: string;
  description: string;
}