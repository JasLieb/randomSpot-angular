import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type action = () => void;
@Injectable({ providedIn: 'root' })
export class SpotifyDataService {
  private token: string | null = null;
  private knowTopArtists = [];

  private errorsSubject = new BehaviorSubject<string[]>([]);
  errors$: Observable<string[]> = this.errorsSubject.asObservable();

  private recommendationsSubject = new BehaviorSubject<
    { id: string; name: string; image: string; isSelected: boolean }[]
  >([]);
  recommendations$: Observable<
    { id: string; name: string; image: string; isSelected: boolean }[]
  > = this.recommendationsSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    this.initToken(() => this.emitTopArtists());
  }

  private getArtist(artist: string): Observable<any> {
    return this.get(`search?q=${artist}&type=artist`);
  }

  getArtistTopTacks(artistId: string): Observable<any> {
    return this.get(`artists/${artistId}/top-tracks?market=FR`);
  }

  getTopArtist(): Observable<any> {
    return this.get(`me/top/artists`);
  }

  searchArtists(artist: string) {
    this.recommendationsSubject.next([]);
    this.getArtist(artist).subscribe((response: any) =>
      response.artists.items
        .filter(
          (a: any) =>
            !this.knowTopArtists.some(
              (kta: any) => kta.name == a.name.toLowerCase()
            )
        )
        .forEach((repArtist: any) => {
          this.emitRecommendationsRelatedArtists(repArtist);
        })
    );
  }

  searchTopTracksArtist(artistId: string): Observable<any> {
    return this.getArtistTopTacks(artistId).pipe(
      map((response: any) => response.tracks)
    );
  }

  makePlaylistFromArtists(
    name: string,
    artists: { id: string; name: string; image: string }[],
    callback: action
  ) {
    forkJoin(
      artists.map((artist) => this.getArtistTopTacks(artist.id))
    ).subscribe((responses) => {
      this.makePlaylist(
        name,
        responses.reduce((acc, response) => acc.concat(response.tracks), []),
        callback
      );
    });
  }

  private makePlaylist(name: string, tracks: any[], callback: action) {
    this.getMe().subscribe((meResponse: any) => {
      this.post(`users/${meResponse.id}/playlists`, {
        name,
      }).subscribe((createdPlaylistResponse: any) => {
        if (tracks.length > 0)
          this.postTrackIntoPlaylist(
            createdPlaylistResponse.id,
            tracks,
            callback
          );
        else callback();
      });
    });
  }

  private postTrackIntoPlaylist(
    playlistId: string,
    tracks: any[],
    callback: action
  ) {
    this.post(`playlists/${playlistId}/tracks`, {
      uris: tracks
        .sort((a, b) => a.track_number - b.track_number)
        .map((track) => track.uri),
    }).subscribe((_) => callback());
  }

  private getMe() {
    return this.get('me');
  }

  private initToken(callback: action) {
    if (!this.tryInitToken()) {
      this.authorize();
      return;
    }
    callback();
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

  private emitTopArtists() {
    this.getTopArtist().subscribe((rep) => {
      this.knowTopArtists = rep.items;
      rep.artists = rep.items;
      this.emitRecommendation(rep);
    });
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
    url +=
      '&redirect_uri=' + encodeURIComponent(environment.redirect_url);
    url += '&state=' + encodeURIComponent(state);
    window.location.href = url;
  }

  private emitErrors(errors: string[]) {
    this.errorsSubject.next(errors);
  }

  private getClientId() {
    let clientId = '';
    if(!environment.production){
      clientId = environment.user_id;
    }
    else{
      clientId = prompt('Please give your Spotify Client ID') || '';
    }
    return clientId;
  }

  private emitRecommendationsRelatedArtists(topArtist: any) {
    this.get(`artists/${topArtist.id}/related-artists`).subscribe(
      (response: any) => {
        this.emitRecommendation(response);
      }
    );
  }

  private emitRecommendation(response: any) {
    if (response.artists.length > 0)
      this.recommendationsSubject.next(this.makeRecommendations(response));
  }

  private makeRecommendations(
    response: any
  ): { id: string; name: string; image: string; isSelected: boolean }[] {
    return this.recommendationsSubject.value.concat(
      (response.artists as []).map((relatedArtist: any) => {
        return this.makeRecommandation(relatedArtist);
      })
    );
  }

  private makeRecommandation(artist: any): {
    id: string;
    name: any;
    image: any;
    isSelected: false;
  } {
    return {
      id: artist.id,
      name: artist.name,
      image: artist.images[0].url,
      isSelected: false,
    };
  }

  private get(url: string) {
    return this.httpClient.get(`https://api.spotify.com/v1/${url}`, {
      headers: this.getHeaders(),
    });
  }

  private post(url: string, data: any) {
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
