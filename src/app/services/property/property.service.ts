import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  collectionData,
  updateDoc,
  serverTimestamp,
  query,
  where,
  documentId,
  limit,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap, map, defer } from 'rxjs';
import { Property, NewProperty } from 'src/app/models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private injector = inject(Injector);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private readonly col = runInInjectionContext(this.injector, () =>
    collection(this.firestore, 'properties')
  );

  getProperties(): Observable<Property[]> {
    const auth$ = defer(() =>
      runInInjectionContext(this.injector, () => authState(this.auth))
    );

    return auth$.pipe(
      switchMap((user) => {
        if (!user) return of([] as Property[]);
        const q = query(this.col, where('ownerId', '==', user.uid));
        return defer(() =>
          runInInjectionContext(
            this.injector,
            () => collectionData(q, { idField: 'id' }) as Observable<Property[]>
          )
        );
      })
    );
  }

  getPropertyById(id: string): Observable<Property | undefined> {
    const auth$ = defer(() =>
      runInInjectionContext(this.injector, () => authState(this.auth))
    );

    return auth$.pipe(
      switchMap((user) => {
        if (!user) return of(undefined);
        const q = query(
          this.col,
          where(documentId(), '==', id),
          where('ownerId', '==', user.uid),
          limit(1)
        );
        return defer(() =>
          runInInjectionContext(
            this.injector,
            () => collectionData(q, { idField: 'id' }) as Observable<Property[]>
          )
        ).pipe(map((arr) => arr[0] as Property | undefined));
      })
    );
  }

  async addProperty(property: NewProperty) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    const name = (property.name ?? '').toString().trim();
    const tenant = (property.tenant ?? '').toString().trim();
    const dueDate = (property.dueDate ?? '').toString().trim();
    const rent = Number(property.rent ?? 0);
    const status = property.status === 'Alugado' ? 'Alugado' : 'Vazio';
    const photo = property.photo ? String(property.photo).trim() : undefined;

    return addDoc(this.col, {
      ownerId: user.uid,
      name,
      tenant,
      rent: isFinite(rent) && rent >= 0 ? rent : 0,
      dueDate,
      status,
      ...(photo ? { photo } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  deleteProperty(id: string) {
    const ref = doc(this.firestore, `properties/${id}`);
    return deleteDoc(ref);
  }

  async updateProperty(id: string, data: Partial<Omit<Property, 'id'>>) {
    const ref = doc(this.firestore, `properties/${id}`);

    const allowed = new Set([
      'name',
      'tenant',
      'rent',
      'dueDate',
      'status',
      'photo',
      'payments',
    ]);

    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(data ?? {})) {
      if (v === undefined || v === null) continue;

      const topKey = k.split('.')[0];
      if (!allowed.has(topKey)) continue;

      if (k === 'rent') {
        const n = Number(v);
        clean[k] = isFinite(n) && n >= 0 ? n : 0;
      } else if (k === 'status') {
        clean[k] = v === 'Alugado' ? 'Alugado' : 'Vazio';
      } else {
        clean[k] = v;
      }
    }

    clean['updatedAt'] = serverTimestamp();

    if (Object.keys(clean).length === 1) return;
    return updateDoc(ref, clean);
  }

  setPaymentStatus(
    id: string,
    year: number,
    month: number,
    status: 'Pago' | 'Pendente' | 'Atrasado'
  ) {
    const ref = doc(this.firestore, `properties/${id}`);
    const path = `payments.${year}.${month}`;
    return updateDoc(ref, {
      [path]: status,
      updatedAt: serverTimestamp(),
    });
  }
}
