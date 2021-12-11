import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InteractableArtist } from 'src/core/models/artist.model';
import { SpotifyDataService } from 'src/services/http/spotify-data.service';

@Component({
  selector: 'app-artist-item',
  templateUrl: './artist-item.component.html',
  styleUrls: ['./artist-item.component.scss'],
})
export class ArtistItemComponent implements OnInit {
  @Input() artist: InteractableArtist;

  topTracks$: Observable<any[]> = of([]);
  isVisibleTopTracks = false;
  
  private wasToggledOnce = false;

  get imageSource(): string {
    return this.artist.images.length > 0 
      ? this.artist.images[0].url
      : ''
  }

  constructor(private spotifyService: SpotifyDataService) {
    this.artist = {id: '', name: '', images: [], isSelected: false};
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
