// src/types/global.ts
export interface IUser {
  id: string;
  email: string;
  name: string;
}

export interface IApiError {
  message: string;
  code?: number;
}
