import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  static jwtString: string;

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let req = request;

    if (AuthInterceptor.jwtString) {
      req = request.clone({
        setHeaders: { Authorization: `Bearer ${AuthInterceptor.jwtString}` },
      });
    }

    return next.handle(req);
  }
}
