import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SpotifyDataService } from 'src/services/http/spotify-data.service';

@Component({
  selector: 'app-artist-item',
  templateUrl: './artist-item.component.html',
  styleUrls: ['./artist-item.component.scss'],
})
export class ArtistItemComponent implements OnInit {
  @Input() artist: { id: string, name: string; image: string, isSelected: boolean };

  topTracks$: Observable<any[]> = of([]);
  isVisibleTopTracks = false;
  
  private wasToggledOnce = false;

  constructor(private spotifyService: SpotifyDataService) {
    this.artist = {id: '', name: '', image: '', isSelected: false};
  }

  ngOnInit(): void {}

  toggleTopTrackArtist($event: any) {
    $event.stopPropagation();
    this.isVisibleTopTracks = !this.isVisibleTopTracks;
    
    if(!this.wasToggledOnce) {
      this.wasToggledOnce = true;
      this.topTracks$ = this.spotifyService.searchTopTracksArtist(
        this.artist.id
      );
    }
  }
}
