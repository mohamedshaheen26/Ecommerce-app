export interface ICategory {
  id?: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  parent_id?: string | null;
  path?: string;
  path_ar?: string;
  created_at?: string;
}

export interface ICategoryValidation {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  parent_id?: string | null;
  path?: string;
  path_ar?: string;
}
