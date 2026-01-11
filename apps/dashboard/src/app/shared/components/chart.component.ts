import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TaskStats } from '../../core/services/task.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="h-64">
        <canvas #statusChart></canvas>
      </div>
      <div class="h-64">
        <canvas #priorityChart></canvas>
      </div>
    </div>
  `
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) stats!: TaskStats;

  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart: Chart | null = null;
  private priorityChart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && !changes['stats'].firstChange) {
      this.updateCharts();
    }
  }

  private createCharts(): void {
    if (!this.stats) return;

    // Status Doughnut Chart
    const statusConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{
          data: [
            this.stats.byStatus['todo'] || 0,
            this.stats.byStatus['in_progress'] || 0,
            this.stats.byStatus['done'] || 0
          ],
          backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#374151'
            }
          },
          title: {
            display: true,
            text: 'Tasks by Status',
            color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#111827'
          }
        }
      }
    };

    this.statusChart = new Chart(this.statusChartRef.nativeElement, statusConfig);

    // Priority Bar Chart
    const priorityConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
          label: 'Tasks',
          data: [
            this.stats.byPriority['high'] || 0,
            this.stats.byPriority['medium'] || 0,
            this.stats.byPriority['low'] || 0
          ],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Tasks by Priority',
            color: document.documentElement.classList.contains('dark') ? '#F3F4F6' : '#111827'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#374151'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
            }
          },
          x: {
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#374151'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.priorityChart = new Chart(this.priorityChartRef.nativeElement, priorityConfig);
  }

  private updateCharts(): void {
    if (this.statusChart && this.stats) {
      this.statusChart.data.datasets[0].data = [
        this.stats.byStatus['todo'] || 0,
        this.stats.byStatus['in_progress'] || 0,
        this.stats.byStatus['done'] || 0
      ];
      this.statusChart.update();
    }

    if (this.priorityChart && this.stats) {
      this.priorityChart.data.datasets[0].data = [
        this.stats.byPriority['high'] || 0,
        this.stats.byPriority['medium'] || 0,
        this.stats.byPriority['low'] || 0
      ];
      this.priorityChart.update();
    }
  }
}
