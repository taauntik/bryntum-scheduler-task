/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        HttpClientModule,
        BryntumSchedulerModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})

export class AppModule { }

