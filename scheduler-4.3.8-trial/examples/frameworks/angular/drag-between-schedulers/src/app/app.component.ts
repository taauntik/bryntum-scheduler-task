/**
 * App component script
 */
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import {scheduler1Config, scheduler2Config } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
    scheduler1Config = scheduler1Config;
    scheduler2Config = scheduler2Config;

    private scheduler1: Scheduler;
    private scheduler2: Scheduler;

    @ViewChild('scheduler1', { static : true }) schedulerComponent1: BryntumSchedulerComponent;
    @ViewChild('scheduler2', { static : true }) schedulerComponent2: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler1 = this.schedulerComponent1.instance;
        this.scheduler2 = this.schedulerComponent2.instance;
        this.scheduler2.addPartner(this.scheduler1);
    }

    /**
     * Handles zoom-in click event
     */
    onZoomIn():void {
        this.scheduler1.zoomIn();
    }

    /**
     * Handles zoom-out click event
     */
    onZoomOut() {
        this.scheduler1.zoomOut();
    }

}
