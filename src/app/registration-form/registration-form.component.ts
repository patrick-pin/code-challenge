import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { UserCardComponent, UserProfile } from './user-card/user-card.component';

const AVAILABLE_SKILLS = ['TypeScript', 'Angular', 'RxJS', 'Node.js', 'CSS', 'Testing'];

const ROLES = ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'Tech Lead', 'Architect'];

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserCardComponent],
  template: `
    <div class="layout">
      <!-- FORM PANEL -->
      <div class="form-panel">
        <h2>Register Profile</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Full Name -->
          <div class="field">
            <label>Full Name</label>
            <input formControlName="name" placeholder="Jane Smith" />
            <span class="error" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              Name is required (min 2 chars)
            </span>
          </div>

          <!-- Email -->
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="jane@example.com" />
            <span class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Valid email required
            </span>
          </div>

          <!-- Role -->
          <div class="field">
            <label>Role</label>
            <select formControlName="role">
              <option value="">-- Select a role --</option>
              <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
            </select>
            <span class="error" *ngIf="form.get('role')?.invalid && form.get('role')?.touched">
              Please select a role
            </span>
          </div>

          <!-- Skills (FormArray checkboxes) -->
          <div class="field">
            <label>Skills</label>
            <div class="skills-grid" formArrayName="skills">
              <label class="checkbox-label" *ngFor="let skill of availableSkills; let i = index">
                <input type="checkbox" [formControlName]="i" />
                {{ skill }}
              </label>
            </div>
            <span class="error" *ngIf="form.get('skills')?.invalid && form.get('skills')?.touched">
              Select at least one skill
            </span>
          </div>

          <!-- Bio -->
          <div class="field">
            <label>Bio</label>
            <textarea formControlName="bio" rows="3" placeholder="Tell us about yourself..."></textarea>
            <span class="error" *ngIf="form.get('bio')?.invalid && form.get('bio')?.touched">
              Bio required (max 200 chars)
            </span>
          </div>

          <button type="submit" [disabled]="isLoading">
            <span *ngIf="isLoading">Saving...</span>
            <span *ngIf="!isLoading">Save Profile</span>
          </button>

          <div class="success-banner" *ngIf="submitSuccess">
            Profile saved successfully!
          </div>
        </form>
      </div>

      <!-- PREVIEW PANEL -->
      <div class="preview-panel">
        <h2>Live Preview</h2>
        <!-- liveUser is passed as input to UserCardComponent -->
        <app-user-card [user]="liveUser"></app-user-card>

        <div class="saved-list" *ngIf="(userService.users$ | async) as users">
          <h3>Saved Profiles ({{ users.length }})</h3>
          <div *ngFor="let u of users" class="saved-item">
            <strong>{{ u.name }}</strong> — {{ u.role }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 32px; max-width: 960px; margin: 0 auto; }
    h2 { margin-top: 0; font-size: 20px; }
    .field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 14px; font-weight: 500; color: #374151; }
    input, select, textarea { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px; }
    input:focus, select:focus, textarea:focus { outline: 2px solid #4f46e5; border-color: transparent; }
    .error { color: #dc2626; font-size: 12px; }
    .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
    button { background: #4f46e5; color: white; padding: 10px 24px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; width: 100%; }
    button:disabled { background: #a5b4fc; cursor: not-allowed; }
    .success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 10px; border-radius: 6px; margin-top: 12px; text-align: center; }
    .saved-list { margin-top: 24px; }
    .saved-item { padding: 8px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    h3 { font-size: 16px; margin-bottom: 8px; }
  `]
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  liveUser: UserProfile | null = null;
  isLoading = false;
  submitSuccess = false;
  availableSkills = AVAILABLE_SKILLS;
  roles = ROLES;

  private destroy$ = new Subject<void>();
  private submit$ = new Subject<UserProfile>();

  constructor(private fb: FormBuilder, public userService: UserService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name:   ['', [Validators.required, Validators.minLength(2)]],
      email:  ['', [Validators.required, Validators.email]],
      role:   ['', Validators.required],
      skills: this.fb.array(
        AVAILABLE_SKILLS.map(() => this.fb.control(false)),
        this.atLeastOneSkillValidator
      ),
      bio: ['', [Validators.required, Validators.maxLength(200)]],
    });

    // Live preview — update card as user types
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        const selectedSkills = AVAILABLE_SKILLS.filter((_, i) => val.skills[i]);
        this.liveUser = val.name || val.email ? {
          name: val.name,
          email: val.email,
          role: val.role,
          skills: selectedSkills,
          bio: val.bio,
        } : null;
      });

    this.submit$
      .pipe(
        takeUntil(this.destroy$),
        mergeMap(user => this.userService.submitUser(user)) // ← BUG 5
      )
      .subscribe({
        next: (result) => {
          this.isLoading = false;
          this.submitSuccess = true;
          this.form.reset();
          setTimeout(() => this.submitSuccess = false, 3000);
        },
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isLoading) return;

    const val = this.form.value;
    const selectedSkills = AVAILABLE_SKILLS.filter((_, i) => val.skills[i]);
    const user: UserProfile = {
      name: val.name,
      email: val.email,
      role: val.role,
      skills: selectedSkills,
      bio: val.bio,
    };

    this.isLoading = true;
    this.submitSuccess = false;
    this.submit$.next(user);
  }

  private atLeastOneSkillValidator(fa: any) {
    const hasOne = (fa.controls as any[]).some(c => c.value === true);
    return hasOne ? null : { noSkills: true };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
