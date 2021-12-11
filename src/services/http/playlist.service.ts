import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Artist } from 'src/core/models/artist.model';
import { Action } from 'src/core/models/utils.model';
import { ArtistService } from './artist.service';
import { MeService } from './me.service';
import { SpotifyDataService } from './spotify-data.service';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  constructor(
    private spotifyService: SpotifyDataService,
    private meService: MeService,
    private artistService: ArtistService
  ) {}

  makePlaylistFromArtists(name: string, artists: Artist[], callback: Action) {
    forkJoin(
      artists.map((artist) => this.artistService.getArtistTopTacks(artist.id))
    ).subscribe((responses) => {
      this.makePlaylist(
        name,
        responses.reduce((acc, response) => acc.concat(response.tracks), []),
        callback
      );
    });
  }

  private makePlaylist(name: string, tracks: any[], callback: Action) {
    this.meService.getMe().subscribe((meResponse: any) => {
      this.spotifyService
        .post(`users/${meResponse.id}/playlists`, {
          name,
        })
        .subscribe((createdPlaylistResponse: any) => {
          if (tracks.length > 0)
            this.postTrackIntoPlaylist(
              createdPlaylistResponse.id,
              tracks,
              callback
            );
          else callback();
        });
    });
  }

  private postTrackIntoPlaylist(
    playlistId: string,
    tracks: any[],
    callback: Action
  ) {
    this.spotifyService
      .post(`playlists/${playlistId}/tracks`, {
        uris: tracks
          .sort((a, b) => a.track_number - b.track_number)
          .map((track) => track.uri),
      })
      .subscribe((_) => callback());
  }
}
