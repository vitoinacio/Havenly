import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Chart, { ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  chart?: Chart;

  alugados = 2;
  vazios = 2;
  pagos = 2;
  receitaTotal = 1000;
  get totalImoveis() {
    return this.alugados + this.vazios + this.pagos;
  }

  ngAfterViewInit() {
    const canvas = this.barChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradBlue = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradBlue.addColorStop(0, '#1a2a8a');
    gradBlue.addColorStop(1, '#000456');

    const gradGreen = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradGreen.addColorStop(0, '#1e9a1a');
    gradGreen.addColorStop(1, '#085100');

    const gradRed = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradRed.addColorStop(0, '#c23a3a');
    gradRed.addColorStop(1, '#650101');

    const dataValues = [this.pagos, this.alugados, this.vazios];

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Pagos', 'Alugados', 'Vazios'],
        datasets: [
          {
            data: dataValues,
            backgroundColor: [gradBlue, gradGreen, gradRed],
            borderWidth: 0,
            hoverOffset: 0,
            spacing: 1,
            borderRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        cutout: '70%', 
        rotation: -0.5 * Math.PI,
        circumference: 360,
      },
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
