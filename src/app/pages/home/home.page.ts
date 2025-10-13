import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { BottomTabsComponent } from 'src/app/components/tabss/bottom-tabs.component';
import { Dashboard } from 'src/app/services/dashboard/dashboard';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonContent,
    CommonModule,
    RouterModule,
    FormsModule,
    RouterLink,
    BottomTabsComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  host: { class: 'ion-page' },
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  private destroy$ = new Subject<void>();
  private chart?: Chart;

  totalImoveis = 0;
  alugados = 0;
  vazios = 0;
  pagos = 0;
  receitaTotal = 0;
  receitaAtual = 0;
  receitaPrevista = 0;

  constructor(private router: Router, private dashboard: Dashboard) {}

  ngOnInit() {
    this.dashboard
      .getDashboard$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.totalImoveis = stats.totalCount;
        this.alugados = stats.rentedCount;
        this.vazios = stats.vacantCount;
        this.pagos = stats.paidThisMonthCount;
        this.receitaTotal = stats.totalRevenue;
        this.receitaAtual = stats.revenuePaidThisMonth;
        this.receitaPrevista = stats.revenueExpectedThisMonth;

        this.initOrUpdateChart();
      });
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => this.initOrUpdateChart());
  }

  private initOrUpdateChart() {
    const canvas = this.barChart?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataValues = [this.pagos, this.alugados, this.vazios];

    const colors = ['#3b82f6', '#22c55e', '#ef4444'];

    if (!this.chart) {
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: ['Pagos (mês)', 'Alugados', 'Vazios'],
          datasets: [
            {
              data: dataValues,
              backgroundColor: colors,
              borderWidth: 0,
              hoverOffset: 4,
              spacing: 1,
              borderRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          cutout: '70%',
          rotation: -0.5 * Math.PI,
          circumference: 360,
        },
      };
      this.chart = new Chart(ctx, config);
    } else {
      this.chart.data.datasets[0].data = dataValues as any;
      this.chart.update();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  goUpgrade() {
    this.router.navigateByUrl('/upgrade-plan');
  }
}
