import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SpotifyDataService } from 'src/services/spotify-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RandomSpot';
  artists$: Observable<{name: string, image: string}[]>;

  constructor(
    private spotifyService: SpotifyDataService
  )
  {
    this.artists$ = spotifyService.recommendations$;
  }

  searchArtist(artist: string) {
    this.spotifyService.searchArtist(artist);
  }

  onKeyPressed(event: any) {
    if (event.code === 'Enter') {
      this.searchArtist(event.srcElement.value);
    }
  }

}
