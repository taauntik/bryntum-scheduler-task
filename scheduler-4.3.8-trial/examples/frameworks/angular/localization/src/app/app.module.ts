/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';

import { AppComponent } from './app.component';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';
import { I18NextModule } from 'angular-i18next';

import { I18N_PROVIDERS } from './i18next';
import { LangSelectComponent } from './lang-select.component';

@NgModule({
    declarations : [
        AppComponent,
        LangSelectComponent
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerModule,
        I18NextModule.forRoot()
    ],
    providers : [
        I18N_PROVIDERS,
        { provide : ErrorHandler, useClass : AppErrorHandler }
    ],

    bootstrap : [AppComponent]
})
export class AppModule { }
