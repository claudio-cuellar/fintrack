import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface Workspace { id: string; name: string; type: 'PERSONAL' | 'FAMILY'; currency: string; timezone: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'; }

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly workspaces = signal<Workspace[]>(this.readWorkspaces());
  readonly selected = signal<Workspace | null>(this.readSelected());
  private readonly api = '/api/v1';
  constructor(private readonly http: HttpClient) {}
  load() { return this.http.get<{ data: Workspace[] }>(`${this.api}/workspaces`).pipe(tap((response) => { this.workspaces.set(response.data); if (!this.selected() && response.data[0]) this.select(response.data[0]); })); }
  select(workspace: Workspace): void { this.selected.set(workspace); localStorage.setItem('fintrack.workspace', JSON.stringify(workspace)); }
  private readWorkspaces(): Workspace[] { try { return JSON.parse(localStorage.getItem('fintrack.workspaces') || '[]') as Workspace[]; } catch { return []; } }
  private readSelected(): Workspace | null { try { return JSON.parse(localStorage.getItem('fintrack.workspace') || 'null') as Workspace | null; } catch { return null; } }
}
