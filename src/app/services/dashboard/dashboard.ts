import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Property } from 'src/app/models/property.model';

type PayStatus = 'Pendente' | 'Pago' | 'Atrasado';

interface DashboardStats {
  totalCount: number;
  rentedCount: number;
  vacantCount: number;
  paidThisMonthCount: number;
  totalRevenue: number;
  revenuePaidThisMonth: number;
  revenueExpectedThisMonth: number;
}

@Injectable({ providedIn: 'root' })
export class Dashboard {
  private propertyCollection = collection(this.firestore, 'properties');

  constructor(private firestore: Firestore) {}

  getProperties(): Observable<Property[]> {
    return collectionData(this.propertyCollection, {
      idField: 'id',
    }) as Observable<Property[]>;
  }

  getDashboard$(): Observable<DashboardStats> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    return this.getProperties().pipe(
      map((list) => {
        let totalCount = list.length;
        let rentedCount = 0;
        let vacantCount = 0;
        let totalRevenue = 0;
        let revenueExpectedThisMonth = 0;
        let revenuePaidThisMonth = 0;
        let paidThisMonthCount = 0;

        for (const p of list) {
          const rent = Number(p.rent) || 0;

          if (p.status === 'Alugado') {
            rentedCount++;
            totalRevenue += rent;
            revenueExpectedThisMonth += rent;
          } else if (p.status === 'Vazio') {
            vacantCount++;
          }

          const statusMes = (p as any)?.payments?.[year]?.[month] as
            | PayStatus
            | undefined;
          if (statusMes === 'Pago') {
            paidThisMonthCount++;
            revenuePaidThisMonth += rent;
          }
        }

        return {
          totalCount,
          rentedCount,
          vacantCount,
          paidThisMonthCount,
          totalRevenue,
          revenuePaidThisMonth,
          revenueExpectedThisMonth,
        };
      })
    );
  }
}
