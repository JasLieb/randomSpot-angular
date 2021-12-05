import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SpotifyDataService } from 'src/services/spotify-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'RandomSpot';
  artists$: Observable<{ name: string; image: string }[]>;
  selectedArtists: any[] = [];

  constructor(private spotifyService: SpotifyDataService) {
    this.artists$ = spotifyService.recommendations$;
    this.artists$.pipe(debounceTime(1000)).subscribe((_) => {
      this.clearSelectedArtists();
    });
  }

  searchSimilarArtists(artist: string) {
    if (artist) {
      this.spotifyService.searchArtists(artist);
    }
  }

  onSearchKeyPressed(event: any) {
    this.onKeyPressed(event, () =>
      this.searchSimilarArtists(event.srcElement.value)
    );
  }

  onPlaylistKeyPressed(event: any) {
    this.onKeyPressed(event, () => this.makePlaylist(event.srcElement.value));
  }

  private onKeyPressed(event: any, callback: () => any) {
    if (event.code === 'Enter') {
      callback();
    }
  }

  makePlaylist(playlistName: string) {
    this.spotifyService.makePlaylistFromArtists(
      playlistName,
      this.selectedArtists,
      () => this.clearSelectedArtists()
    );
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

  private clearSelectedArtists() {
    this.selectedArtists = [];
  }
}
