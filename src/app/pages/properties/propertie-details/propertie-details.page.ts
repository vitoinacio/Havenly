import { Component, OnDestroy } from '@angular/core';
import {
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonBadge,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonHeader,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Property } from 'src/app/models/property.model';
import { PropertyService } from 'src/app/services/property/property.service';
import { PropertyPayStatus } from 'src/app/models/property-pay-status';
import { ToastService } from 'src/app/services/toast/toast';

// Se seu AddressVM estiver no mesmo arquivo do model de Property, importe-o também:
import type { AddressVM } from 'src/app/models/property.model';

@Component({
  selector: 'app-property-details',
  standalone: true,
  templateUrl: './propertie-details.page.html',
  styleUrls: ['./propertie-details.page.scss'],
  imports: [
    IonHeader,
    CommonModule,
    FormsModule,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonBadge,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon,
  ],
})
export class PropertieDetailsPage implements OnDestroy {
  private destroy$ = new Subject<void>();

  property: Property | null = null;
  currentYear = new Date().getFullYear();

  months: { idx: number; nome: string; status: PropertyPayStatus }[] = [];

  isPaymentOpen = false;
  editingMonth: {
    idx: number;
    nome: string;
    status: PropertyPayStatus;
  } | null = null;
  paymentForm: { status: PropertyPayStatus } = { status: 'Pendente' };

  // Modal de edição
  isEditOpen = false;

  // Form de edição — garante address sempre definido para não dar undefined no template
  form: Partial<Omit<Property, 'id' | 'ownerId'>> & {
    photo?: string;
    address: AddressVM;
  } = {
    name: '',
    tenant: '',
    rent: 0,
    dueDate: '',
    status: 'Vazio',
    address: { cep: '', city: '', neighborhood: '', number: '' },
  };

  // Estado de CEP no modal de edição (reativo)
  editCepLoading = false;
  editCepError = '';
  private lastCepQueriedEdit: string | null = null;
  private cepDebounceHandle: any = null;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private toast: ToastService
  ) {
    const paramId = this.route.snapshot.paramMap.get('id') ?? '';
    const navState = history.state?.property as Property | undefined;

    if (navState && navState.id === paramId) {
      this.property = { ...navState };
      this.recomputeMonths();
      this.overlayPaymentsFromDoc();
    } else {
      this.propertyService
        .getProperties()
        .pipe(takeUntil(this.destroy$))
        .subscribe((list) => {
          this.property = list.find((p) => p.id === paramId) ?? null;
          this.recomputeMonths();
          this.overlayPaymentsFromDoc();
        });
    }
  }

  // ---------- Util / Meses ----------
  private recomputeMonths() {
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const today = new Date();
    const currentMonth = today.getMonth();
    const dueDay = this.getDueDay();

    this.months = nomes.map((nome, idx) => {
      let status: PropertyPayStatus = 'Pendente';
      if (idx < currentMonth) status = 'Atrasado';
      else if (idx === currentMonth)
        status = today.getDate() <= dueDay ? 'Pendente' : 'Atrasado';
      return { idx, nome, status };
    });
  }

  private overlayPaymentsFromDoc() {
    if (!this.property) return;
    const yearMap = (this.property as any).payments?.[this.currentYear] ?? {};
    this.months = this.months.map((m) => {
      const stored = yearMap[m.idx] as PropertyPayStatus | undefined;
      return stored ? { ...m, status: stored } : m;
    });
  }

  private getDueDay(): number {
    if (!this.property?.dueDate) return 1;
    const d = new Date(this.property.dueDate);
    const day = d.getDate();
    return Number.isFinite(day) && day > 0 ? day : 1;
    }

  // ---------- Pagamento ----------
  openPayment(m: { idx: number; nome: string; status: PropertyPayStatus }) {
    this.editingMonth = { ...m };
    this.paymentForm = { status: m.status };
    this.isPaymentOpen = true;
  }

  closePayment() {
    this.isPaymentOpen = false;
    this.editingMonth = null;
  }

  async savePayment() {
    if (!this.property || !this.editingMonth) return;

    const i = this.months.findIndex((x) => x.idx === this.editingMonth!.idx);
    if (i >= 0) {
      this.months[i] = { ...this.months[i], status: this.paymentForm.status };
    }

    try {
      const fieldPath = `payments.${this.currentYear}.${this.editingMonth.idx}`;
      await this.propertyService.updateProperty(this.property.id, {
        [fieldPath]: this.paymentForm.status,
      } as any);

      this.toast.show(
        `Pagamento de ${this.editingMonth.nome} salvo!`,
        'success'
      );
    } catch (e) {
      console.error('Erro ao salvar status do mês', e);
      this.toast.show('Erro ao salvar pagamento.', 'danger');
    }

    this.closePayment();
  }

  // ---------- Editar ----------
  openEdit() {
    if (!this.property) return;

    const addr = this.property.address ?? {
      cep: '', city: '', neighborhood: '', number: ''
    };

    this.form = {
      name: this.property.name,
      tenant: this.property.tenant ?? '',
      rent: this.property.rent,
      dueDate: this.property.dueDate || '',
      status: this.property.status,
      photo: this.property.photo ?? undefined,
      address: {
        cep: addr.cep ?? '',
        city: addr.city ?? '',
        neighborhood: addr.neighborhood ?? '',
        number: addr.number ?? '',
      },
    };

    this.isEditOpen = true;
    this.editCepError = '';
    this.editCepLoading = false;
    this.lastCepQueriedEdit = null;
  }

  closeEdit() {
    this.isEditOpen = false;
  }

  private normalizeCep(raw: string) {
    return (raw || '').replace(/\D/g, '').slice(0, 8);
  }

  onEditCepInput(ev: any) {
    const raw = ev?.detail?.value ?? '';
    const cep = this.normalizeCep(raw);

    if (!this.form.address) {
      this.form.address = { cep: '', city: '', neighborhood: '', number: '' };
    }
    this.form.address.cep = cep;

    this.editCepError = '';
    if (this.cepDebounceHandle) {
      clearTimeout(this.cepDebounceHandle);
      this.cepDebounceHandle = null;
    }

    if (cep.length < 8) {
      this.editCepLoading = false;
      return;
    }

    this.cepDebounceHandle = setTimeout(() => {
      if (cep !== this.lastCepQueriedEdit) {
        this.lookupCepEdit(cep);
      }
    }, 300);
  }

  private async lookupCepEdit(cep: string) {
    this.editCepLoading = true;
    this.editCepError = '';
    this.lastCepQueriedEdit = cep;

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
        this.editCepError = 'CEP não encontrado.';
        return;
      }

      const city = (data?.localidade ?? '').toString().trim();
      const neighborhood = (data?.bairro ?? '').toString().trim();

      this.form.address = {
        cep,
        city: city || this.form.address.city || '',
        neighborhood: neighborhood || this.form.address.neighborhood || '',
        number: this.form.address.number || '',
      };
    } catch (err: any) {
      this.editCepError =
        err?.name === 'AbortError'
          ? 'Tempo de resposta excedido ao buscar o CEP.'
          : 'Não foi possível consultar o CEP agora.';
    } finally {
      this.editCepLoading = false;
    }
  }

  async saveEdit() {
    if (!this.property) return;

    const photoClean = this.form.photo ? String(this.form.photo).trim() : '';
    const addr = this.form.address ?? {
      cep: '', city: '', neighborhood: '', number: ''
    };

    const patch: Partial<Omit<Property, 'id' | 'ownerId'>> = {
      name: (this.form.name ?? this.property.name)?.toString().trim(),
      tenant: (this.form.tenant ?? '').toString().trim() || 'Disponível',
      rent: Number(this.form.rent ?? this.property.rent) || 0,
      dueDate: this.form.dueDate ?? this.property.dueDate ?? '',
      status: (this.form.status ?? this.property.status) as Property['status'],
      ...(photoClean ? { photo: photoClean } : {}),
      address: {
        cep: this.normalizeCep(addr.cep || ''),
        city: (addr.city || '').trim(),
        neighborhood: (addr.neighborhood || '').trim(),
        number: (addr.number ?? '').toString().trim(),
      },
    };

    try {
      await this.propertyService.updateProperty(this.property.id, patch as any);
      this.property = { ...this.property, ...patch };

      this.recomputeMonths();
      this.overlayPaymentsFromDoc();

      if (!photoClean && 'photo' in patch) {
        delete (this.property as any).photo;
      }

      this.toast.show('Imóvel atualizado com sucesso!', 'success');
      this.closeEdit();
    } catch (e) {
      console.error('Erro ao atualizar imóvel', e);
      this.toast.show('Erro ao atualizar imóvel.', 'danger');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cepDebounceHandle) {
      clearTimeout(this.cepDebounceHandle);
    }
  }
}
