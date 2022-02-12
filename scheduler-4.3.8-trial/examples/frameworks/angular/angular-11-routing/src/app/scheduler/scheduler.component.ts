import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler, SchedulerConfig } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { schedulerConfig } from './scheduler.config';

@Component({
    selector    : 'app-scheduler',
    templateUrl : './scheduler.component.html',
    styleUrls   : ['./scheduler.component.scss']
})
export class SchedulerComponent implements AfterViewInit  {

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent | undefined;

    scheduler: Scheduler | undefined;
    public schedulerConfig: Partial<SchedulerConfig> = schedulerConfig

    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }
}
