import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SpotifyDataService } from 'src/services/spotify-data.service';

@Component({
  selector: 'app-artist-item',
  templateUrl: './artist-item.component.html',
  styleUrls: ['./artist-item.component.scss'],
})
export class ArtistItemComponent implements OnInit {
  @Input() artist: any;
  @Output() artistSelected = new EventEmitter<boolean>();

  topTracks$: Observable<any[]> = of([]);

  isSelected = false;

  constructor(private spotifyService: SpotifyDataService) {}

  ngOnInit(): void {}

  searchTopTrackArtist($event: any) {
    $event.stopPropagation();
    this.topTracks$ = this.spotifyService.searchTopTracksArtist(
      this.artist.name
    );
  }

  selectItem() {
    this.isSelected = !this.isSelected;
    this.artistSelected.emit(this.isSelected);
  }
}
