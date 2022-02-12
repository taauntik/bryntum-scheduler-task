/**
 * Angular advanced demo app module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Scheduler1Component } from './scheduler1/scheduler1.component';
import { Scheduler2Component } from './scheduler2/scheduler2.component';
import { RouteReuseStrategy } from '@angular/router';
import { MyReuseStrategy } from './router/my-reuse-strategy';
import { barMarginReducer } from './store/app.reducer';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';

@NgModule({
    declarations : [
        AppComponent,
        Scheduler1Component,
        Scheduler2Component
    ],
    imports : [
        BrowserModule,
        AppRoutingModule,
        BryntumSchedulerModule,
        StoreModule.forRoot({
            barMargin : barMarginReducer
        })
    ],
    providers : [
        { provide : RouteReuseStrategy, useClass : MyReuseStrategy },
        { provide : ErrorHandler, useClass : AppErrorHandler }
    ],
    bootstrap : [AppComponent]
})
export class AppModule { }

