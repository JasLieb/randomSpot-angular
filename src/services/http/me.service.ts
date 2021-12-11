import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SpotifyDataService } from './spotify-data.service';

@Injectable({ providedIn: 'root' })
export class MeService {
  constructor(private spotifyService: SpotifyDataService) {}

  getMe(): Observable<any> {
    return this.spotifyService.get('me');
  }

  getTopArtists(): Observable<any> {
    return this.spotifyService.get(`me/top/artists`);
  }
}
