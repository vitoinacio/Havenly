import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, of, switchMap, defer, map } from 'rxjs';
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
  private afs = inject(Firestore);
  private auth = inject(Auth);
  private injector = inject(Injector);

  private readonly propertiesCol = runInInjectionContext(this.injector, () =>
    collection(this.afs, 'properties')
  );

  private auth$ = defer(() =>
    runInInjectionContext(this.injector, () => authState(this.auth))
  );

  getProperties(): Observable<Property[]> {
    return this.auth$.pipe(
      switchMap((user) => {
        if (!user) return of([] as Property[]);

        const q = query(this.propertiesCol, where('ownerId', '==', user.uid));

        return defer(() =>
          runInInjectionContext(
            this.injector,
            () => collectionData(q, { idField: 'id' }) as Observable<Property[]>
          )
        );
      })
    );
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

            const statusMes = (p as any)?.payments?.[year]?.[month] as
              | PayStatus
              | undefined;

            if (statusMes === 'Pago') {
              paidThisMonthCount++;
              revenuePaidThisMonth += rent;
            }
          } else if (p.status === 'Vazio') {
            vacantCount++;
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
