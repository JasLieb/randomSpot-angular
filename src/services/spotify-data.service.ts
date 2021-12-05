import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject  } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SpotifyDataService {
  private USER_ID = environment.user_id;
  private token = "";
  private knowTopArtists = [];

  private recommendationsSubject = new BehaviorSubject<
    { name: string; image: string }[]
  >([]);
  recommendations$: Observable<{ name: string; image: string }[]> =
    this.recommendationsSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    this.initToken();
  }

  getArtist(artist: string): Observable<any> {
    return this.get(`search?q=${artist}&type=artist`); 
  }

  getArtistTopTacks(artist: string) : Observable<any> {
    return this.getArtist(artist)
      .pipe(
        switchMap((rep: any) => {
          const foundArtist = rep.artists.items.find((ar: any) => ar.name.toLowerCase() === artist.toLowerCase()) || rep.artists.items[0];
          return this.get(`artists/${foundArtist.id}/top-tracks?market=FR`)
        })
      )
  }

  getTopArtist(): Observable<any> {
    return this.get(`me/top/artists`); 
  }

  searchArtists(artist: string) {
    this.recommendationsSubject.next([]);
    this.getArtist(artist).subscribe(
      (response: any) => 
        response
          .artists
          .items
          .filter(
            (a: any) => 
              !this.knowTopArtists.some((kta: any) => kta.name == a.name.toLowerCase())
          )
          .forEach(
            (repArtist: any) => {
            this.emitRecommendationsRelatedArtists(repArtist);
          })
    );
  }

  searchTopTracksArtist(artist: string): Observable<any> {
    return this.getArtistTopTacks(artist)
    .pipe(
      map(
        (response: any) => response.tracks
      )
    );
  }

  private initToken() {
    const url = window.location.href;
    if(url.includes('access_token=')) {
      this.token = url.substring(
        url.indexOf("access_token=") + 'access_token='.length,
        url.lastIndexOf("&token_type=")
      );
    }
    else
      this.authorize();

    this.emitTopArtists();
  }

  private emitTopArtists() {
    this.getTopArtist().subscribe(
      rep => {
        this.knowTopArtists = rep.items;
        rep.artists = rep.items;
        this.emitRecommendation(rep);
      }
    );
  }

  private authorize() {
    var scope = 'user-read-private user-top-read';
    var state = "suyenjuyridkgprm";
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(this.USER_ID);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent("http://localhost:4200/redirect");
    url += '&state=' + encodeURIComponent(state);
    window.location.href = url;
  }

  private emitRecommendationsRelatedArtists(topArtist: any) {
    this.get(`artists/${topArtist.id}/related-artists`).subscribe(
      (response: any) => {
        this.emitRecommendation(response);
      }
    );
  }

  private emitRecommendation(response: any) {
    if(response.artists.length > 0)
      this.recommendationsSubject.next(
        this.makeRecommendations(response)
      );
  }

  private makeRecommendations(response: any): { name: string; image: string; }[] {
    return this.recommendationsSubject.value.concat(
      (response.artists as [])
        .map((relatedArtist: any) => {
          return {
            name: relatedArtist.name,
            image: relatedArtist.images[0].url,
          };
        })
    );
  }

  private get(url: string) {
    return this.httpClient.get(
      `https://api.spotify.com/v1/${url}`,
      { 
        headers: this.getHeaders() 
      }
    );
  }

  private post(url: string, data: any) {
    return this.httpClient.post(
      `https://api.spotify.com/v1/${url}`,
      data,
      {
        headers: this.getHeaders()
      }
    )
  }

  private getHeaders() : HttpHeaders{
    return new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json');
  }
}
