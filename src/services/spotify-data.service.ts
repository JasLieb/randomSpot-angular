import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

  searchArtist(artist: string) {
    this.recommendationsSubject.next([]);
    this.getArtist(artist).subscribe(
      (response: any) => 
        response
          .artists
          .items
          .filter(
            (a: any) => 
              a.name.toLowerCase() === artist.toLowerCase()
              && !this.knowTopArtists.some((kta: any) => kta.name == artist.toLowerCase())
          )
          .forEach(
            (repArtist: any) => {
            this.emitRecommendationsRelatedArtists(repArtist);
          })
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
    this.get(`artists/${topArtist.id}/related-artists?limit`).subscribe(
      (response: any) => {
        this.emitRecommendation(response);
      }
    );
  }

  private emitRecommendation(response: any) {
    this.recommendationsSubject.next(
      this.makeRecommendations(response)
    );
  }

  private makeRecommendations(response: any): { name: string; image: string; }[] {
    return this.recommendationsSubject.value.concat(
      (response.artists as [])
        .filter((artist: any) =>
          !(
            (response.artists as any[]).filter(a => a.name == artist.name).length > 1 ||
            false
          )
        )
        .map((relatedArtist: any) => {
          return {
            name: relatedArtist.name,
            image: relatedArtist.images[0].url,
          };
        })
    );
  }

  getArtist(artist: string): Observable<any> {
    return this.get(`search?q=${artist}&type=artist`); 
  }

  getTopArtist(): Observable<any> {
    return this.get(`me/top/artists`); 
  }

  private get(url: string) {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json');

    return this.httpClient.get(
      `https://api.spotify.com/v1/${url}`, 
      {headers}
    );
  }
}
