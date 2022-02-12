/**
 * App module
 */
// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';

// components
import { AppComponent } from './app.component';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';

@NgModule({
    declarations : [
        AppComponent
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerModule
    ],
    providers : [{ provide : ErrorHandler, useClass : AppErrorHandler }],
    bootstrap : [AppComponent]
})
export class AppModule { }
