import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { HttpClient } from '@angular/common/http';
import { DateHelper, Scheduler, StringHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
import AppEventModel from './lib/AppEventModel';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    @ViewChild(BryntumSchedulerComponent) schedulerComponent: BryntumSchedulerComponent;

    // application properties
    scheduler: Scheduler;
    selectedEventName  = '';

    pickerDate = new Date(2018, 1, 7);

    // bind properties from the application to the scheduler component
    barMargin = 5;
    endDate = new Date(2018, 1, 7, 22);
    events = [];
    resourceImagePath = 'assets/users/';
    resources = [];
    rowHeight = 50;
    startDate = new Date(2018, 1, 7, 8);
    timeRanges = [];
    timeRangesFeature = true;
    viewPreset = 'hourAndDay';
    columns = [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name'
        },
        {
            text   : 'Type',
            field  : 'role',
            width  : 130,
            editor : {
                type        : 'combo',
                items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ];

    eventStore = {
        modelClass : AppEventModel
    }

    eventEditFeature = {
        // Add extra widgets to the event editor
        items : {
            descriptionField : {
                type   : 'text',
                name   : 'desc',
                label  : 'Description',
                weight : 100
            },
            eventTypeField : {
                type   : 'combo',
                name   : 'eventType',
                label  : 'Type',
                // Provided items start at 100, and go up in 100s, so insert after first one
                weight : 110,
                items  : ['Appointment', 'Internal', 'Meeting', 'Important']
            },
            eventColorField : {
                type        : 'combo',
                label       : 'Color',
                name        : 'eventColor',
                editable    : false,
                clearable   : true,
                weight      : 120,
                listItemTpl : item => `<div class="color-box b-sch-${StringHelper.encodeHtml(item.value)}"></div><div>${StringHelper.encodeHtml(item.text)}</div>`,
                items       : Scheduler.eventColors.map(color => [color, StringHelper.capitalize(color)])
            }
        }
    };

    eventRenderer = ({ eventRecord }): string => {
        return `
        <div class="info">
            <div class="name">${eventRecord.name}</div>
            <div class="desc">${eventRecord.desc}</div>
        </div>
      `;
    };

    constructor(private http: HttpClient) {
        this.getData();
    }

    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }

    //fetch data for the scheduler
    getData(): void {
        const me = this;
        me.http.get('./assets/data/data.json').subscribe(data => {
            me.resources = data['resources'].rows;
            me.events = data['events'].rows;
            me.timeRanges = data['timeRanges'].rows;
        });
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
