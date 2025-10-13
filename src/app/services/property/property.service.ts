import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  collectionData,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Property } from 'src/app/models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private propertyCollection = collection(this.firestore, 'properties');

  constructor(private firestore: Firestore) {}

  getProperties(): Observable<Property[]> {
    return collectionData(this.propertyCollection, {
      idField: 'id',
    }) as Observable<Property[]>;
  }

  addProperty(property: Omit<Property, 'id'>) {
    return addDoc(this.propertyCollection, property);
  }

  deleteProperty(id: string) {
    const propertyDoc = doc(this.firestore, `properties/${id}`);
    return deleteDoc(propertyDoc);
  }

  updateProperty(id: string, data: Partial<Omit<Property, 'id'>>) {
    const propertyDoc = doc(this.firestore, `properties/${id}`);

    const clean: Record<string, any> = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) clean[k] = v;
    });

    return updateDoc(propertyDoc, clean);
  }
}
