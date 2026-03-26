import { Injectable } from '@angular/core';
import { Subject, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { UserProfile } from './user-card/user-card.component';

@Injectable({ providedIn: 'root' })
export class UserService {

  private _users = new Subject<UserProfile[]>();
  users$ = this._users.asObservable();

  private _userList: UserProfile[] = [];

  submitUser(user: UserProfile) {
    return of(user).pipe(
      delay(2000),

      tap(u => {
        u.skills = u.skills.map(s => s.toUpperCase());
        this._userList = [...this._userList, u];
        this._users.next(this._userList);
      }),

      map(u => ({ success: true, savedUser: u }))
    );
  }

  getUsers() {
    this._users.next(this._userList);
  }
}
