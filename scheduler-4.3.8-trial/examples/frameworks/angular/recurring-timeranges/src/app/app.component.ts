/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumButtonComponent, BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler, DateHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { MyTimeRange } from './lib/MyTimeRange';
import { schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {

    public schedulerConfig = schedulerConfig;
    private scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    @ViewChild(BryntumButtonComponent, { static : true }) coffeeButton: BryntumButtonComponent;

    /**
     * Runs after the view (including the child scheduler) is initializes
     */
    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }

    onCoffeeClick(): void {
        const coffee = this.scheduler.features.timeRanges.store.getById(1) as MyTimeRange;
        coffee.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TH;';
        this.coffeeButton.instance.disabled = true;
    }

    onPrevClick(): void {
        this.scheduler.shiftPrevious();
    }

    onTodayClick(): void {
        const today = DateHelper.clearTime(new Date());
        today.setHours(5);
        this.scheduler.setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
    }

    onNextClick(): void {
        this.scheduler.shiftNext();
    }

    onStartClick(): void {
        this.scheduler.setTimeSpan(new Date(2019, 1, 7, 8), new Date(2019, 1, 29, 18));
    }
}
