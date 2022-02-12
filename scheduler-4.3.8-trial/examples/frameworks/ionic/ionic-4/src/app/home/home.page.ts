import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { DateHelper, Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import AppEventModel from '../lib/AppEventModel';
import { schedulerConfig } from '../app.config';

@Component({
    selector    : 'app-home',
    templateUrl : 'home.page.html',
    styleUrls   : ['home.page.scss']
})
export class HomePage implements AfterViewInit {

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    schedulerConfig: any = schedulerConfig;

    // application properties
    scheduler: Scheduler;
    selectedEventName  = '';
    pickerDate = new Date(2018, 1, 7);
    barMargin = 5;

    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }

    //add event button click handled here
    onAddEventClick(): void {
        const { scheduler } = this;

        const event = new AppEventModel({
            resourceId   : scheduler.resourceStore.first.id,
            startDate    : scheduler.startDate,
            duration     : 2,
            durationUnit : 'h',
            name         : 'Meet CEO',
            desc         : 'Discuss project',
            eventType    : 'Meeting',
            eventColor   : 'red'
        });

        scheduler.editEvent(event);
    }

    //remove event button click handled here
    onRemoveEventClick(): void {
        const { scheduler } = this;
        scheduler.eventStore.remove(scheduler.selectedEvents);
    }

    onBarMarginChange({ value }): void {
        this.barMargin = value;
    }

    onEventSelectionChange(): void {
        if (this.scheduler.selectedEvents.length > 0) {
            this.selectedEventName = this.scheduler.selectedEvents[0].name;
        }
        else {
            this.selectedEventName = '';
        }
    }

    onReleaseEvent(): void {
        this.selectedEventName = '';
    }

    onDatePickerChange({ value }) : void {
        this.scheduler.setTimeSpan(
            DateHelper.add(value, 8, 'hour'),
            DateHelper.add(value, 18, 'hour')
        );
    }
}
