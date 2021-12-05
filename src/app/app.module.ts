import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SpotifyDataService } from 'src/services/http/spotify-data.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArtistItemComponent } from './artist-item/artist-item.component';

@NgModule({
  declarations: [AppComponent, ArtistItemComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule,
  ],
  providers: [SpotifyDataService],
  exports: [ArtistItemComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
