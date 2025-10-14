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

  isEditOpen = false;

  form: Partial<Omit<Property, 'id' | 'ownerId'>> & { photo?: string } = {
    name: '',
    tenant: '',
    rent: 0,
    dueDate: '',
    status: 'Vazio',
  };

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

  private recomputeMonths() {
    const nomes = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
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
      this.toast.show('Erro ao salvar pagamento.', 'danger'); // 👈
    }

    this.closePayment();
  }

  openEdit() {
    if (!this.property) return;
    this.form = {
      name: this.property.name,
      tenant: this.property.tenant ?? '',
      rent: this.property.rent,
      dueDate: this.property.dueDate || '',
      status: this.property.status,
      photo: this.property.photo ?? undefined,
    };
    this.isEditOpen = true;
  }

  closeEdit() {
    this.isEditOpen = false;
  }

  async saveEdit() {
    if (!this.property) return;

    const photoClean = this.form.photo ? String(this.form.photo).trim() : '';
    const patch: Partial<Omit<Property, 'id' | 'ownerId'>> = {
      name: (this.form.name ?? this.property.name)?.toString().trim(),
      tenant: (this.form.tenant ?? '').toString().trim() || 'Disponível',
      rent: Number(this.form.rent ?? this.property.rent) || 0,
      dueDate: this.form.dueDate ?? this.property.dueDate ?? '',
      status: (this.form.status ?? this.property.status) as Property['status'],
      ...(photoClean ? { photo: photoClean } : {}),
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
  }
}
