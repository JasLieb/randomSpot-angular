import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SpotifyDataService } from 'src/services/spotify-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'RandomSpot';
  artists$: Observable<{ name: string; image: string }[]>;
  private selectedArtists: any[] = [];

  constructor(private spotifyService: SpotifyDataService) {
    this.artists$ = spotifyService.recommendations$;
    this.artists$.subscribe((_) => {
      this.selectedArtists = [];
    });
  }

  searchSimilarArtists(artist: string) {
    if (artist) {
      this.spotifyService.searchArtists(artist);
    }
  }

  onKeyPressed(event: any) {
    if (event.code === 'Enter') {
      this.searchSimilarArtists(event.srcElement.value);
    }
  }

  selectArtist(artist: any, isSelected: boolean) {
    const isArtist = (a: any): boolean => a.name === artist.name;
    if (isSelected) {
      if (!this.selectedArtists.some(isArtist))
        this.selectedArtists.push(artist);
    } else {
      this.selectedArtists = this.selectedArtists.filter(isArtist);
    }
  }
}
