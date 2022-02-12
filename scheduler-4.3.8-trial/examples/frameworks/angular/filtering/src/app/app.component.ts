import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { HttpClient } from '@angular/common/http';
import { DateHelper, DomClassList, Scheduler, WidgetHelper, StringHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
import AppEventModel from './lib/AppEventModel';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    private scheduler: Scheduler;
    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    @ViewChild('datePickerContainer', { static : true }) datePickerContainer: ElementRef;

    // bind properties from the application to the scheduler component

    pickerDate = new Date(2018, 1, 7);

    rowHeight = 50;
    selectedEventName = '';
    events = [];
    resources = [];
    timeRanges = [];
    barMargin = 5;
    startDate = new Date(2018, 1, 7, 8);
    endDate = new Date(2018, 1, 7, 22);
    resourceImagePath = 'assets/users/';
    filterBarFeature = true;
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
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
    }

    getData(): void {
        const me = this;

        me.http.get('./assets/data/data.json').subscribe((data) => {
            me.resources = data['resources'].rows;
            me.events = data['events'].rows;
            me.timeRanges = data['timeRanges'].rows;
        });
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

    // add event button click handled here
    onAddEventClick(): void {
        const
            { scheduler } = this,
            resource = scheduler.resourceStore.first;

        if (!resource) {
            WidgetHelper.toast('There is no resource available');
            return;
        }

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

    // remove event button click handled here
    onRemoveEventClick(): void {
        const { scheduler } = this;
        scheduler.eventStore.remove(scheduler.selectedEvents);
    }

    // change scheduler start/end dates
    onDatePickerChange({ value }): void {
        this.scheduler.setTimeSpan(
            DateHelper.add(value, 8, 'hour'),
            DateHelper.add(value, 18, 'hour')
        );
    }

    filterEvents({ value }): void {
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        this.scheduler.eventStore.filter({
            filters : (event) => event.name.match(new RegExp(value, 'i')),
            replace : true
        });
    }

    highlightEvents({ value }): void {
        const { scheduler } = this;

        scheduler.eventStore.forEach(event => {
            const taskClassList = new DomClassList(event.cls);

            if (value !== '' && event.name.toLowerCase().includes(value.toLowerCase())) {
                taskClassList.add('b-match');
            }
            else {
                taskClassList.remove('b-match');
            }

            event.cls = taskClassList.value;
        }, this);

        scheduler.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
    }
}
