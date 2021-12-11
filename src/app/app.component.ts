import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Artist, InteractableArtist } from 'src/core/models/artist.model';
import { SpotifyDataService } from 'src/services/http/spotify-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'RandomSpot';
  errors$: Observable<string[]>;
  artists$: Observable<InteractableArtist[]>;
  selectedArtists: InteractableArtist[] = [];

  constructor(private spotifyService: SpotifyDataService) {
    this.errors$ = spotifyService.errors$;
    this.artists$ = spotifyService.recommendations$;
    this.artists$.pipe(debounceTime(1000)).subscribe((_) => {
      this.clearSelectedArtists();
    });
  }

  searchSimilarArtists(artistName: string) {
    if (artistName) {
      this.spotifyService.searchArtists(artistName);
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

  selectArtist(artist: Artist) {
    artist.isSelected = !artist.isSelected;
    if (artist.isSelected) {
      this.selectedArtists.push(artist);
    } else {
      this.selectedArtists = this.selectedArtists.reduce(
        (acc, selectedArtist) => {
          if (selectedArtist.id !== artist.id) 
            acc.push(selectedArtist);
          return acc;
        },
        [] as Artist[]
      );
    }
  }

  clearSelectedArtists() {
    this.selectedArtists.forEach((artist) => (artist.isSelected = false));
    this.selectedArtists = [];
  }

  private onKeyPressed(event: any, callback: () => any) {
    if (event.code === 'Enter') {
      callback();
    }
  }
}
