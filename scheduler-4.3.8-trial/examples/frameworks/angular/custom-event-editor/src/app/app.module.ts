/**
 * App module
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppErrorHandler } from './error.handler';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';
import { EventEditorComponent } from './event-editor/event-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogContent } from '@angular/material/dialog';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DateTimeFieldComponent } from './date-time-field/date-time-field.component';

@NgModule({
    declarations: [
        AppComponent,
        EventEditorComponent,
        DateTimeFieldComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        BryntumSchedulerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [{ provide: ErrorHandler, useClass: AppErrorHandler }],
    bootstrap: [AppComponent]
})
export class AppModule { }
