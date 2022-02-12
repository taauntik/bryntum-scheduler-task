/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { EventHelper, Popup, ResourceModel, ResourceModelConfig, Scheduler, Tooltip } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { schedulerConfig, colors, EmployeeResourceModel } from './app.config';

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
        const { scheduler } = this;

        // Tooltip for add client buttons (plain divs)
        new Tooltip({
            forSelector : '.add',
            html        : 'Add client',
            hideDelay   : 100
        });

        // Handle click on those add divs
        EventHelper.addListener(scheduler.element, {
            element  : scheduler.element,
            delegate : '.add',
            click(event: any) {
                const
                    employee = scheduler.getRecordFromElement(event.target) as EmployeeResourceModel,
                    data = new EmployeeResourceModel({
                        name  : 'New client',
                        color : colors[Math.floor(Math.random() * colors.length)].toLowerCase()
                    });

                if (employee) {
                    // Add a new client with random color
                    employee.appendChild(data);
                }
            }
        });

    }

    onCatchAll(event: any): void {
        switch (event.type) {
            case 'dragcreateend':
                this.onDragCreateEnd(event);
                break;
            default:
        }
    }

    onCellDblClick({ record, cellElement, column }): void {
        // Show a custom editor when dbl clicking a client cell
        if (column.field === 'name' && record.isLeaf) {
            new Popup({
                autoShow     : true,
                autoClose    : true,
                closeAction  : 'destroy',
                scrollAction : 'realign',
                forElement   : cellElement,
                anchor       : true,
                width        : '20em',
                cls          : 'client-editor',
                items        : [{
                    type       : 'text',
                    name       : 'name',
                    label      : 'Client',
                    labelWidth : '4em',
                    value      : record.name,
                    onChange   : ({ value }) => {
                        record.name = value;
                    }
                }, {
                    type        : 'combo',
                    cls         : 'b-last-row',
                    name        : 'color',
                    label       : 'Color',
                    labelWidth  : '4em',
                    items       : colors.map(color => [color.toLowerCase(), color]),
                    listItemTpl : (data: any) => `<div class="color-item ${data.value}"></div>${data.text}`,
                    value       : record.color,
                    onChange    : ({ value }) => {
                        record.color = value;
                    }
                }]
            });
        }
    }

    onDragCreateEnd({ newEventRecord, resourceRecord }): void {
        // Make new event have correct type, to show correct fields in event editor
        newEventRecord.type = resourceRecord.isLeaf ? 'client' : 'employee';
    }

}
