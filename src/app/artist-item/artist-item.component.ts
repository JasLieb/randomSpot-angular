import { Component, Input, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { SpotifyDataService } from 'src/services/spotify-data.service';

@Component({
  selector: 'app-artist-item',
  templateUrl: './artist-item.component.html',
  styleUrls: ['./artist-item.component.scss']
})
export class ArtistItemComponent implements OnInit {

  @Input() artist : any;
  topTracks$: Observable<any[]> = of([]);
    

  constructor(
    private spotifyService: SpotifyDataService
  ) { }

  ngOnInit(): void {
  }

  searchTopTrackArtist() {
    this.topTracks$ = this.spotifyService.searchTopTracksArtist(this.artist.name);
  }

}
