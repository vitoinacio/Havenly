import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonSearchbar,
  IonIcon,
  IonFabButton,
  IonFab,
  IonFabList,
  IonBadge,
  IonButton,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { BottomTabsComponent } from 'src/app/components/tabss/bottom-tabs.component';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Property } from 'src/app/models/property.model';
import { PropertyService } from 'src/app/services/property/property.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.page.html',
  styleUrls: ['./properties.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    IonModal,
    IonInput,
    IonButton,
    IonBadge,
    IonFabList,
    IonFab,
    IonFabButton,
    IonIcon,
    IonSearchbar,
    IonContent,
    BottomTabsComponent,
    IonSelect,
    IonSelectOption,
  ],
  providers: [PropertyService],
})
export class PropertiesPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Fonte da verdade (Firestore)
  private allProperties: Property[] = [];
  // Lista exibida (filtrada)
  properties: Property[] = [];

  activeFilter: 'all' | 'rented' | 'vacant' = 'all';
  searchQuery = '';

  constructor(
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit() {
    // stream do Firestore
    this.propertyService
      .getProperties()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list: Property[] | null) => {
      this.allProperties = list ?? [];
      this.applyFilters();
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private normalize(s: string): string {
    return (s ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private applyFilters() {
    const q = this.normalize(this.searchQuery);
    let list = [...this.allProperties];

    if (this.activeFilter === 'rented') {
      list = list.filter((p) => p.status === 'Alugado');
    } else if (this.activeFilter === 'vacant') {
      list = list.filter((p) => p.status === 'Vazio');
    }

    if (q) {
      list = list.filter(
        (p) =>
          this.normalize(p.name).includes(q) ||
          this.normalize(p.tenant ?? '').includes(q)
      );
    }

    this.properties = list;
  }

  handleInput(ev: Event) {
    const value = (ev as any).detail?.value ?? '';
    this.searchQuery = value;
    this.applyFilters();
  }

  setFilter(key: 'all' | 'rented' | 'vacant') {
    this.activeFilter = key;
    this.applyFilters();
  }

  isModalOpen = false;
  newProperty: Omit<Property, 'id'> = {
    name: '',
    tenant: '',
    rent: 0,
    dueDate: '',
    status: 'Vazio',
  };

  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  async saveProperty() {
    const toSave: Omit<Property, 'id'> = {
      name: this.newProperty.name?.trim() || 'Novo Imóvel',
      tenant: this.newProperty.tenant?.trim() || 'Disponível',
      rent: Number(this.newProperty.rent) || 0,
      dueDate: this.newProperty.dueDate || '',
      status: this.newProperty.status,
    };

    try {
      await this.propertyService.addProperty(toSave as Property);
      this.newProperty = {
        name: '',
        tenant: '',
        rent: 0,
        dueDate: '',
        status: 'Vazio',
      };
      this.closeModal();
    } catch (e) {
      console.error('Erro ao adicionar imóvel', e);
    }
  }

  selectionMode = false;
  selectedIdx = new Set<number>();

  startDeleteMode() {
    this.selectionMode = true;
    this.selectedIdx.clear();
  }
  cancelSelection() {
    this.selectionMode = false;
    this.selectedIdx.clear();
  }

  toggleSelectByIndex(i: number) {
    if (!this.selectionMode) return;
    this.selectedIdx.has(i)
      ? this.selectedIdx.delete(i)
      : this.selectedIdx.add(i);
  }
  isSelectedIndex(i: number) {
    return this.selectedIdx.has(i);
  }

  async deleteSelected() {
    if (this.selectedIdx.size === 0) {
      this.cancelSelection();
      return;
    }

    const selectedDocs = [...this.selectedIdx]
      .map((i) => this.properties[i])
      .filter((p) => !!p?.id) as Required<Property>[];

    try {
      await Promise.all(
        selectedDocs.map((p) => this.propertyService.deleteProperty(p.id))
      );
    } catch (e) {
      console.error('Erro ao excluir imóveis', e);
    } finally {
      this.cancelSelection();
    }
  }

  goToDetails(property: Property) {
    this.router.navigate(['/propertie-details', property.id], {
      state: { property },
    });
  }
}
