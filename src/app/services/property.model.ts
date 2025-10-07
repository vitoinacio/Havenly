export interface Property {
  id?: string;
  photo: string;
  name: string;
  tenant?: string;
  rent: number;
  dueDate: string;
  status: 'Alugado' | 'Vazio';
}