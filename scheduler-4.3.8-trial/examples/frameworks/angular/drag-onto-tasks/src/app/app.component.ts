/**
 * App component script
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BryntumGridComponent, BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { AjaxStore, AjaxStoreConfig, DragHelper, EventModel, Grid, Model, Scheduler, Toast, WidgetHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
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

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    @ViewChild(BryntumGridComponent, { static : true }) gridComponent: BryntumGridComponent;

    ngAfterViewInit(): void {
        // Store Scheduler/Grid instance
        this.scheduler = this.schedulerComponent.instance;
        this.grid = this.gridComponent.instance;

        const
            { scheduler, grid } = this,
            equipmentStore = new EquipmentStore({
                modelClass : EventModel,
                readUrl    : 'assets/data/equipment.json',
                sorters    : [
                    { field : 'name', ascending : true }
                ],
                durationUnit : 'h',
                equipment    : []
            });

        grid.store = equipmentStore.makeChained(() => true, [], {});

        // event renderer expects equipmentStore to be class property of scheduler
        scheduler['equipmentStore'] = equipmentStore;
        scheduler.on({
            eventEditBeforeSetRecord : this.onEventEditBeforeSetRecord,
            thisObj                  : this,
            once                     : true
        });

        equipmentStore.load({}).then(event => {
            this.onEquipmentStoreLoad(event);
        });

        this.initDrag();

        setTimeout(() => {
            Toast.show({
                timeout : 3500,
                html    : 'Please note that this example uses the Bryntum Grid, which is licensed separately.'
            });
        }, 500);

    }

    onEventEditBeforeSetRecord({ source : editor  }): void {
        const equipmentCombo = editor.widgetMap.equipmentCombo;

        if (!equipmentCombo.items.length) {
            equipmentCombo.items = this.scheduler['equipmentStore'].getRange();
        }
    }

    onEquipmentStoreLoad({ source : store }): void {
        // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is loaded
        this.scheduler.refreshRows();
    }

    initDrag(): void {
        const { scheduler, grid } = this,

            drag = new DragHelper({
                cloneTarget        : true,
                mode               : 'translateXY',
                dropTargetSelector : '.b-sch-event',
                targetSelector     : '.b-grid-cell',
                outerElement       : grid.element
            });

        drag.on({
            dragstart : ({ event, context }) => {
                // save a reference to the equipment so we can access it later
                context.equipment = grid.getRecordFromElement(context.grabbed);

                // Prevent tooltips from showing while dragging
                scheduler.element.classList.add('b-dragging-event');
            },

            drop : ({ context, event }) => {
                if (context.valid) {
                    const
                        equipment = context.equipment,
                        eventRecord = scheduler.resolveEventRecord(context.target);

                    eventRecord['equipment'] = eventRecord['equipment'].concat(equipment);
                    context.finalize();

                    // Dropped on a scheduled event, display toast
                    WidgetHelper.toast(`Added ${equipment.name} to ${eventRecord.name}`);
                }

                scheduler.element.classList.remove('b-dragging-event');
            }
        });
    }

}

type EquipmentStoreConfig = AjaxStoreConfig & {
    durationUnit: string
    equipment: Model[]
};

class EquipmentStore extends AjaxStore {
    durationUnit: string;
    equipment: Model[];

    constructor(config: Partial<EquipmentStoreConfig>) {
        super(config);
    }
}
