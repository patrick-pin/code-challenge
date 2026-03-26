import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  skills: string[];
  bio: string;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" *ngIf="user">
      <div class="card-header">
        <div class="avatar">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
        <div>
          <h3>{{ user.name }}</h3>
          <span class="role-badge">{{ user.role }}</span>
        </div>
      </div>
      <p class="email">{{ user.email }}</p>
      <p class="bio">{{ user.bio }}</p>
      <div class="skills">
        <span class="skill-tag" *ngFor="let skill of user.skills">{{ skill }}</span>
      </div>
    </div>

    <div class="card empty" *ngIf="!user">
      <p>Fill in the form to preview your profile</p>
    </div>
  `,
  styles: [`
    .card { padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; }
    .card.empty { text-align: center; color: #999; min-height: 120px; display: flex; align-items: center; justify-content: center; }
    .card-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
    h3 { margin: 0; font-size: 18px; }
    .role-badge { background: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .email { color: #666; font-size: 14px; margin: 8px 0; }
    .bio { font-size: 14px; color: #444; margin: 8px 0; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .skill-tag { background: #f0fdf4; color: #16a34a; padding: 2px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #bbf7d0; }
  `],
  imports: [],
})
export class UserCardComponent {
  user: UserProfile | null = null;
}
