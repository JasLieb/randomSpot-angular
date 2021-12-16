import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Artist, InteractableArtist } from 'src/core/models/artist.model';
import { ExternalImage } from 'src/core/models/external-image.model';
import { ArtistService } from 'src/services/http/artist.service';
import { PlaylistService } from 'src/services/http/playlist.service';
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

  constructor(
    private spotifyService: SpotifyDataService,
    private artistService: ArtistService,
    private playlistService: PlaylistService
  ) {
    this.errors$ = this.spotifyService.errors$;
    this.artists$ = of([
      ({
        name: 'toto',
        id: '123',
        images: [{ url: 'https://m.media-amazon.com/images/I/51gu8z94KNL.jpg' } as ExternalImage],
        isSelected: false,
      } as InteractableArtist),
    ]);
    // this.artistService.recommendations$;
    // this.artists$.pipe(debounceTime(1000)).subscribe((_) => {
    //   this.clearSelectedArtists();
    // });

    // this.spotifyService.tokenInitialized$.subscribe((isInitialized) => {
    //   if (isInitialized) this.artistService.emitTopArtists();
    // });
  }

  searchSimilarArtists(artistName: string) {
    if (artistName) {
      this.artistService.searchArtists(artistName);
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
    this.playlistService.makePlaylistFromArtists(
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
          if (selectedArtist.id !== artist.id) acc.push(selectedArtist);
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
