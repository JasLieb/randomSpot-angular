import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist, InteractableArtist } from 'src/core/models/artist.model';
import { MeService } from './me.service';
import { SpotifyDataService } from './spotify-data.service';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private knowTopArtists = [];
  private recommendationsSubject = new BehaviorSubject<InteractableArtist[]>(
    []
  );
  recommendations$: Observable<InteractableArtist[]> =
    this.recommendationsSubject.asObservable();

  constructor(
    private spotifyService: SpotifyDataService,
    private meService: MeService
  ) {}

  emitTopArtists() {
    this.meService.getTopArtists().subscribe((rep) => {
      this.knowTopArtists = rep.items;
      rep.artists = rep.items;
      this.emitRecommendation(rep.artists);
    });
  }

  getArtistTopTacks(artistId: string): Observable<any> {
    return this.spotifyService.get(`artists/${artistId}/top-tracks?market=FR`);
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

  private getArtist(artist: string): Observable<any> {
    return this.spotifyService.get(`search?q=${artist}&type=artist`);
  }

  private emitRecommendationsRelatedArtists(topArtist: Artist) {
    this.spotifyService
      .get(`artists/${topArtist.id}/related-artists`)
      .subscribe((response: any) => {
        this.emitRecommendation(response.artists);
      });
  }

  private emitRecommendation(artists: Artist[]) {
    if (artists.length > 0)
      this.recommendationsSubject.next(this.makeRecommendations(artists));
  }

  private makeRecommendations(artists: Artist[]): Artist[] {
    return this.recommendationsSubject.value
      .concat(
        artists.map((relatedArtist) => this.makeRecommandation(relatedArtist))
      )
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  private makeRecommandation(artist: Artist): InteractableArtist {
    return {
      id: artist.id,
      name: artist.name,
      images: artist.images,
      isSelected: false,
    };
  }
}
