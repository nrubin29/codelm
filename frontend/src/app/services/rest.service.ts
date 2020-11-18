import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private baseUrl = '/api/';
  jwtString: string;

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const headers = new HttpHeaders();

    if (this.jwtString) {
      headers.set('Authorization', `Bearer ${this.jwtString}`);
    }

    return headers;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.http
      .get<T>(this.baseUrl + endpoint, { headers: this.headers })
      .toPromise();
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.http
      .post<T>(this.baseUrl + endpoint, body, { headers: this.headers })
      .toPromise();
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.http
      .put<T>(this.baseUrl + endpoint, body, { headers: this.headers })
      .toPromise();
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.http
      .delete<T>(this.baseUrl + endpoint, { headers: this.headers })
      .toPromise();
  }
}
