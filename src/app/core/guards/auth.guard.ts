import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = () => {
  const fb     = inject(FirebaseService);
  const router = inject(Router);

  if (fb.currentUser) return true;
  return router.createUrlTree(['/']);
};
