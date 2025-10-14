export interface Property {
  id: string;
  ownerId: string;
  name: string;
  tenant?: string;
  rent: number;
  dueDate: string;
  photo?: string;
  status: 'Alugado' | 'Vazio';
}

export type NewProperty = Omit<Property, 'id' | 'ownerId'>;
