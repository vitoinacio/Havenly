export interface Property {
  id: string;
  ownerId: string;
  name: string;
  tenant?: string;
  rent: number;
  dueDate: string;
  photo?: string;
  status: 'Alugado' | 'Vazio';
  address?: {
    cep?: string;
    city?: string;
    neighborhood?: string;
    number?: string;
  };
}

export type NewProperty = Omit<Property, 'id' | 'ownerId'>;

export type AddressVM = {
  cep: string;
  city: string;
  neighborhood: string;
  number: string;
};
