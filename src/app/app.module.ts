import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';

import {SelectivePreloadingStrategy} from './services/preloading-router';

import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import {AppStorage} from './services/global/storage';

import {APP_PAGES} from './pages';
import { XrouterModule } from './pages/xrouter/xrouter.module';
import { WrapRouterRoutingModule } from './wrouter/wrap-router-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    ...APP_PAGES,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(ROUTES,{preloadingStrategy: SelectivePreloadingStrategy}),
    XrouterModule,
    WrapRouterRoutingModule,
  ],
  providers: [
    SelectivePreloadingStrategy,
    LocalStorageService, SessionStorageService,
    AppStorage
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
