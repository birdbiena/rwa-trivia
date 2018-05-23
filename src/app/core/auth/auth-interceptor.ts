import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { Store } from '@ngrx/store';

import { AppState } from '../../store';
import { authorizationHeader } from '../store';
import { AuthenticationProvider } from './authentication.provider';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<AppState>, private authService: AuthenticationProvider, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth header from the service.
    let authHeader;
    this.store.select(authorizationHeader).subscribe(ah => {
      authHeader = ah
    }
    );

    if (authHeader) {
      // Clone the request to add the new header.
      let authReq = req.clone({ headers: req.headers.set('Authorization', authHeader) });
      // Pass on the cloned request instead of the original request.
      return next.handle(authReq).catch((error, caught) => {

        if (error.status === 401) {
          // logout users, redirect to login page
          this.authService.logout();
          this.router.navigate(['/dashboard']);

        }

        if (error.status === 419) {

          return this.authService.refreshToken().mergeMap((tokenResponse) => {
            authReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + tokenResponse) });
            return next.handle(authReq);
          });

        }

        //return all others errors 
        return Observable.throw(error);

      }) as any;
    } else {
      return next.handle(req);
    }
  }
}
