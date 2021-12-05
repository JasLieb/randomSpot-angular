import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SpotifyDataService } from 'src/services/http/spotify-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'RandomSpot';
  artists$: Observable<
    { id: string; name: string; image: string; isSelected: boolean }[]
  >;
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

  makePlaylist(playlistName: string) {
    this.spotifyService.makePlaylistFromArtists(
      playlistName,
      this.selectedArtists,
      () => this.clearSelectedArtists()
    );
  }

  selectArtist(artist: {
    id: string;
    name: string;
    image: string;
    isSelected: boolean;
  }) {
    artist.isSelected = !artist.isSelected;
  }

  private clearSelectedArtists() {
    this.selectedArtists = [];
  }

  private onKeyPressed(event: any, callback: () => any) {
    if (event.code === 'Enter') {
      callback();
    }
  }
}
