import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { FadeOnScrollDirective } from '../../shared/directives/fade-on-scroll.directive';
import { Project } from '../../core/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonComponent, FadeOnScrollDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  projectService = inject(ProjectService);

  projects = signal<Project[]>([]);
  loading  = signal(true);
  filter   = signal<string>('all');

  allTechs   = signal<string[]>([]);

  ngOnInit(): void {
    this.projectService.getAll().subscribe({
      next: list => {
        const sorted = list.sort((a, b) => a.order - b.order);
        this.projects.set(sorted);
        const techs = [...new Set(sorted.flatMap(p => p.techStack))];
        this.allTechs.set(techs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get filtered(): Project[] {
    if (this.filter() === 'all') return this.projects();
    return this.projects().filter(p => p.techStack.includes(this.filter()));
  }

  setFilter(tech: string): void {
    this.filter.set(tech);
  }
}
