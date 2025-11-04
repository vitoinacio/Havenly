import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
import {
  Property,
  NewProperty,
  AddressVM,
} from 'src/app/models/property.model';
import { PropertyService } from 'src/app/services/property/property.service';

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
  private allProperties: Property[] = [];
  properties: Property[] = [];

  activeFilter: 'all' | 'rented' | 'vacant' = 'all';
  searchQuery = '';

  // Modal / Form
  isModalOpen = false;

  // Estado da busca de CEP (opcional para exibir mensagens/spinners)
  cepLookupLoading = false;
  cepLookupError = '';

  // Controle para evitar chamadas repetidas e debouncing
  private lastCepQueried: string | null = null;
  private cepDebounceHandle: any = null;

  // Garante que address SEMPRE exista (evita undefined no template)
  newProperty: NewProperty & { address: AddressVM } = {
    name: '',
    tenant: '',
    rent: 0,
    dueDate: '',
    status: 'Vazio',
    address: { cep: '', city: '', neighborhood: '', number: '' },
  };

  constructor(
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit() {
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
    if (this.cepDebounceHandle) {
      clearTimeout(this.cepDebounceHandle);
    }
  }

  // --------- Lista / Filtro ---------
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

  // --------- Modal ---------
  openModal() {
    if (!this.newProperty.address) {
      this.newProperty.address = {
        cep: '',
        city: '',
        neighborhood: '',
        number: '',
      };
    }
    this.isModalOpen = true;
    this.cepLookupError = '';
    this.cepLookupLoading = false;
    this.lastCepQueried = null;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // --------- CEP reativo ---------
  private normalizeCep(raw: string) {
    return (raw || '').replace(/\D/g, '').slice(0, 8);
  }

  /**
   * Chamado a cada digitação no campo CEP.
   * Quando completar 8 dígitos, consulta ViaCEP e preenche cidade/bairro.
   */
  onCepInput(ev: any) {
    const raw = ev?.detail?.value ?? '';
    const cep = this.normalizeCep(raw);

    if (!this.newProperty.address) {
      this.newProperty.address = {
        cep: '',
        city: '',
        neighborhood: '',
        number: '',
      };
    }
    this.newProperty.address.cep = cep;

    // limpamos estados e debounce anterior
    this.cepLookupError = '';
    if (this.cepDebounceHandle) {
      clearTimeout(this.cepDebounceHandle);
      this.cepDebounceHandle = null;
    }

    if (cep.length < 8) {
      this.cepLookupLoading = false;
      return;
    }

    // debounce curto para evitar rajada de requisições
    this.cepDebounceHandle = setTimeout(() => {
      if (cep !== this.lastCepQueried) {
        this.lookupCep(cep);
      }
    }, 300);
  }

  private async lookupCep(cep: string) {
    this.cepLookupLoading = true;
    this.cepLookupError = '';
    this.lastCepQueried = cep;

    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 8000);

      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: ctrl.signal,
      });
      clearTimeout(to);

      if (!res.ok) throw new Error('Falha na consulta de CEP');

      const data = await res.json();
      if (data?.erro) {
        this.cepLookupError = 'CEP não encontrado.';
        return;
      }

      const city = (data?.localidade ?? '').toString().trim();
      const neighborhood = (data?.bairro ?? '').toString().trim();

      // mantém valores já digitados se API não retornar
      this.newProperty.address = {
        cep,
        city: city || this.newProperty.address.city || '',
        neighborhood:
          neighborhood || this.newProperty.address.neighborhood || '',
        number: this.newProperty.address.number || '',
      };
    } catch (err: any) {
      this.cepLookupError =
        err?.name === 'AbortError'
          ? 'Tempo de resposta excedido ao buscar o CEP.'
          : 'Não foi possível consultar o CEP agora.';
    } finally {
      this.cepLookupLoading = false;
    }
  }

  // --------- Salvar ---------
  async saveProperty() {
    const addr = this.newProperty.address || {
      cep: '',
      city: '',
      neighborhood: '',
      number: '',
    };

    const toSave: NewProperty = {
      name: (this.newProperty.name || '').trim() || 'Novo Imóvel',
      tenant: (this.newProperty.tenant || '').trim() || 'Disponível',
      rent: Number(this.newProperty.rent) || 0,
      dueDate: this.newProperty.dueDate || '',
      status: this.newProperty.status,
      address: {
        cep: this.normalizeCep(addr.cep || ''),
        city: (addr.city || '').trim(),
        neighborhood: (addr.neighborhood || '').trim(),
        number: (addr.number ?? '').toString().trim(),
      },
    };

    try {
      await this.propertyService.addProperty(toSave);
      // reset do form (address garantido)
      this.newProperty = {
        name: '',
        tenant: '',
        rent: 0,
        dueDate: '',
        status: 'Vazio',
        address: { cep: '', city: '', neighborhood: '', number: '' },
      };
      this.cepLookupError = '';
      this.cepLookupLoading = false;
      this.lastCepQueried = null;

      this.closeModal();
    } catch (e) {
      console.error('Erro ao adicionar imóvel', e);
    }
  }

  // --------- Seleção / Exclusão ---------
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
