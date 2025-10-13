import { Component, OnInit } from '@angular/core';
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

type Status = 'Alugado' | 'Vazio' | 'Pago';

interface Property {
  id: number;
  title: string;
  tenant: string;
  price: number;
  status: Status;
}

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
})
export class PropertiesPage implements OnInit {
  private allProperties: Property[] = [];

  properties: Property[] = [];

  activeFilter: 'all' | 'rented' | 'vacant' = 'all';
  searchQuery = '';

  ngOnInit() {
    this._idCounter = this.allProperties.reduce(
      (m, p) => Math.max(m, p.id || 0),
      0
    );
    this.applyFilters();
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
          this.normalize(p.title).includes(q) ||
          this.normalize(p.tenant).includes(q)
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
  newProperty = {
    address: '',
    tenant: '',
    price: 0,
    status: 'Vazio' as Status,
  };
  private _idCounter = 0;

  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  saveProperty() {
    const prop: Property = {
      id: ++this._idCounter,
      title: this.newProperty.address || 'Novo Imóvel',
      tenant: this.newProperty.tenant?.trim() || 'Disponível',
      price: Number(this.newProperty.price) || 0,
      status: this.newProperty.status,
    };

    this.allProperties = [prop, ...this.allProperties];
    this.newProperty = { address: '', tenant: '', price: 0, status: 'Vazio' };
    this.applyFilters();
    this.closeModal();
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

  deleteSelected() {
    if (this.selectedIdx.size === 0) {
      this.cancelSelection();
      return;
    }

    const toRemove = new Set<Property>(
      [...this.selectedIdx].map((i) => this.properties[i])
    );

    this.allProperties = this.allProperties.filter((p) => !toRemove.has(p));

    this.applyFilters();
    this.cancelSelection();
  }
}
