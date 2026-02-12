export interface ICategory {
  id?: string;
  slug: string;
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
  slug: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  parent_id?: string | null;
  path?: string;
  path_ar?: string;
}

