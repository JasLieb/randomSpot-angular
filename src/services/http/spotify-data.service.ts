import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SpotifyDataService {
  private token: string | null = null;

  private tokenInitializedSubject = new BehaviorSubject<boolean>(false);
  tokenInitialized$: Observable<boolean> =
    this.tokenInitializedSubject.asObservable();

  private errorsSubject = new BehaviorSubject<string[]>([]);
  errors$: Observable<string[]> = this.errorsSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    this.initToken();
  }

  private initToken() {
    if (!this.tryInitToken()) {
      this.authorize();
      return;
    }
    this.tokenInitializedSubject.next(true);
  }

  private tryInitToken(): boolean {
    this.token = sessionStorage.getItem('token');
    const url = window.location.href;
    if (!this.token && url.includes('access_token=')) {
      this.token = url.substring(
        url.indexOf('access_token=') + 'access_token='.length,
        url.lastIndexOf('&token_type=')
      );
      window.location.href = url.substring(0, url.indexOf('/'));
      sessionStorage.setItem('token', this.token);
    }
    return !!this.token;
  }

  private authorize() {
    let clientId = this.getClientId();
    if (!clientId) {
      this.emitErrors([
        'Without your Client ID, no connection are possible to your Spotify account',
      ]);
      return;
    }

    var scope = 'user-read-private user-top-read';
    var state = 'suyenjuyridkgprm';
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(clientId);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(environment.redirect_url);
    url += '&state=' + encodeURIComponent(state);
    window.location.href = url;
  }

  private emitErrors(errors: string[]) {
    this.errorsSubject.next(errors);
  }

  private getClientId() {
    let clientId = '';
    if (!environment.production) {
      clientId = environment.user_id;
    } else {
      clientId = prompt('Please give your Spotify Client ID') || '';
    }
    return clientId;
  }

  get(url: string) {
    return this.httpClient.get(`https://api.spotify.com/v1/${url}`, {
      headers: this.getHeaders(),
    });
  }

  post(url: string, data: any) {
    return this.httpClient.post(`https://api.spotify.com/v1/${url}`, data, {
      headers: this.getHeaders(),
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json');
  }
}
