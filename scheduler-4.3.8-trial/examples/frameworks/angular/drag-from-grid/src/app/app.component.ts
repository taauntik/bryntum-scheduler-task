/**
 * App Component script
 */
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { BryntumGridComponent, BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { DateHelper, DomHelper, DragHelper, EventModel, EventStore, Grid, Rectangle, Scheduler, Store, Toast, WidgetHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { gridConfig, schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
    schedulerConfig: any = schedulerConfig;
    gridConfig: any = gridConfig;

    private scheduler: Scheduler;
    private grid: Grid;
    private eventStore: EventStore;

    @Input() autoRescheduleTasks = false;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    @ViewChild(BryntumGridComponent, { static : true }) gridComponent: BryntumGridComponent;

    ngAfterViewInit(): void {
        // Store Scheduler/Grid instance
        this.scheduler = this.schedulerComponent.instance;
        this.grid = this.gridComponent.instance;
        this.eventStore = this.scheduler.eventStore;
        const { scheduler, grid, eventStore } = this;

        eventStore.on({
            update : ({ record, changes }) => {
                if ('resourceId' in changes && !record.resourceId) {
                    eventStore.remove(record);
                    (grid.store as Store).add(record);
                }
                if (this.autoRescheduleTasks) {
                    this.rescheduleOverlappingTasks(record);
                }
            },
            add : ({ records }) => {
                if (this.autoRescheduleTasks) {
                    records.forEach((eventRecord) => this.rescheduleOverlappingTasks(eventRecord));
                }
            }
        });

        this.initDrag();

        setTimeout(() => {
            Toast.show({
                timeout : 3500,
                html    : 'Please note that this example uses the Bryntum Grid, which is licensed separately.'
            });
        }, 500);

    }

    onToggle({ pressed } : { pressed : boolean }): void {
        this.autoRescheduleTasks = pressed;
    }

    initDrag(): void {
        const
            { scheduler, grid } = this,
            drag                = new DragHelper({
                cloneTarget        : true,
                mode               : 'translateXY',
                // Only allow drops on the schedule area
                dropTargetSelector : '.b-timeline-subgrid',
                // Only allow drag of row elements inside on the unplanned grid
                targetSelector     : '.b-grid-row:not(.b-group-row)',
                constrain          : false,
                outerElement       : grid.element,
                // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
                scrollManager      : scheduler.scrollManager
            });

        drag.on({
            dragstart : ({ context }) => {
                const
                    mouseX = context.clientX,
                    proxy = context.element,
                    task = grid.getRecordFromElement(context.grabbed) as EventModel,
                    newWidth = scheduler.timeAxisViewModel.getDistanceForDuration(task.durationMS)
                ;

                // save a reference to the task so we can access it later
                context.task = task;

                // Mutate dragged element (grid row) to look like an event bar
                proxy.classList.remove('b-grid-row');
                proxy.classList.add('b-sch-event-wrap');
                proxy.classList.add('b-sch-event');
                proxy.classList.add('b-unassigned-class');
                proxy.classList.add(`b-${scheduler.mode}`);
                proxy.innerHTML = `<i class="${task.iconCls}"></i> ${task.name}`;

                // If the new width is narrower than the grabbed element...
                if (context.grabbed.offsetWidth > newWidth) {
                    const proxyRect = Rectangle.from(context.grabbed);

                    // If the mouse is off (nearly or) the end, centre the element on the mouse
                    if (mouseX > proxyRect.x + newWidth - 20) {
                        context.newX = context.elementStartX = context.elementX = mouseX - newWidth / 2;
                        DomHelper.setTranslateX(proxy, context.newX);
                    }
                }

                proxy.style.width = `${newWidth}px`;

                // Prevent tooltips from showing while dragging
                scheduler.element.classList.add('b-dragging-event');

            },
            drag : ({ context }) => {
                const
                    { task } = context,
                    startDate = scheduler.getDateFromCoordinate(DomHelper.getTranslateX(context.element), 'round', false),
                    endDate = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
                    resource = context.target && scheduler.resolveResourceRecord(context.target)
                ;

                // Don't allow drops anywhere, only allow drops if the drop is on the time axis and on top of a Resource
                context.valid = context.valid && Boolean(startDate && resource) &&
                    (this.schedulerComponent.allowOverlap || scheduler.isDateRangeAvailable(startDate, endDate, null, resource));

                // Save reference to resource so we can use it in onTaskDrop
                context.resource = resource;
            },
            drop : ({ context }) => {
                const
                    task = context.task,
                    target = context.target
                ;

                // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
                if (context.valid && target) {
                    const date = scheduler.getDateFromCoordinate(DomHelper.getTranslateX(context.element), 'round', false),
                        // Try resolving event record from target element, to determine if drop was on another event
                        targetEventRecord = scheduler.resolveEventRecord(context.target);

                    if (date) {
                        // Remove from grid first so that the data change
                        // below does not fire events into the grid.
                        (grid.store as Store).remove(task);

                        task.setStartDate(date, true);
                        // task.startDate = date;
                        task.resource = context.resource;
                        scheduler.eventStore.add(task);
                    }

                    // Dropped on a scheduled event, display toast
                    if (targetEventRecord) {
                        WidgetHelper.toast(`Dropped on ${targetEventRecord.name}`);
                    }

                    context.finalize();
                }
                else {
                    drag.abort();
                }

                scheduler.element.classList.remove('b-dragging-event');

            }
        });
    }

    rescheduleOverlappingTasks(eventRecord : EventModel): void {
        if (eventRecord.resource) {
            const
                futureEvents = [],
                earlierEvents = [];

            // Split tasks into future and earlier tasks
            eventRecord.resource.events.forEach(event => {
                if (event !== eventRecord) {
                    if (event.startDate >= eventRecord.startDate) {
                        futureEvents.push(event);
                    }
                    else {
                        earlierEvents.push(event);
                    }
                }
            });

            if (futureEvents.length || earlierEvents.length) {
                futureEvents.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
                earlierEvents.sort((a, b) => a.startDate > b.startDate ? -1 : 1);

                futureEvents.forEach((ev, i) => {
                    const prev = futureEvents[i - 1] || eventRecord;
                    ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
                });

                // Walk backwards and remove any overlap
                [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
                    const prev = all[i - 1];

                    if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
                        ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
                    }
                });
            }
        }
    }

}
