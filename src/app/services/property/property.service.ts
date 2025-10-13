import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Property {
  id?: string;
  photo: string;
  name: string;
  tenant?: string;
  rent: number;
  dueDate: string;
  status: 'Alugado' | 'Vazio';
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private propertyCollection = collection(this.firestore, 'properties');

  constructor(private firestore: Firestore) {}

  getProperties(): Observable<Property[]> {
    return collectionData(this.propertyCollection, { idField: 'id' }) as Observable<Property[]>;
  }

  addProperty(property: Property) {
    return addDoc(this.propertyCollection, property);
  }

  deleteProperty(id: string) {
    const propertyDoc = doc(this.firestore, `properties/${id}`);
    return deleteDoc(propertyDoc);
  }
}