import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private baseUrl = '/api/';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Promise<T> {
    return this.http.get<T>(this.baseUrl + endpoint).toPromise();
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.http.post<T>(this.baseUrl + endpoint, body).toPromise();
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.http.put<T>(this.baseUrl + endpoint, body).toPromise();
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.http.delete<T>(this.baseUrl + endpoint).toPromise();
  }
}
