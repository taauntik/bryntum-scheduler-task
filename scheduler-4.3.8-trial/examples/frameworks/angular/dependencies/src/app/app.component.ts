/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
    public schedulerConfig: any = schedulerConfig;
    private scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
    }
}
