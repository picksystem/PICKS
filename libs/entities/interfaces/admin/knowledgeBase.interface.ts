export interface IAdminKBArticle {
  id: number;
  title: string;
  description: string;
  status: string;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
