import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Project } from '../models';

const COLLECTION = 'projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private fb = inject(FirebaseService);

  getAll(): Observable<Project[]> {
    return this.fb.getAll<Project>(COLLECTION);
  }

  getById(id: string): Observable<Project | null> {
    return this.fb.getById<Project>(COLLECTION, id);
  }

  create(project: Omit<Project, 'id'>): Promise<string> {
    return this.fb.add<Omit<Project, 'id'>>(COLLECTION, project);
  }

  update(id: string, data: Partial<Project>): Promise<void> {
    return this.fb.update<Project>(COLLECTION, id, data);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(COLLECTION, id);
  }
}
