/**
 * Application component
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EventEditorComponent } from './event-editor/event-editor.component';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
    schedulerConfig: any = schedulerConfig;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;
    private scheduler: Scheduler;

    constructor(public editor: MatDialog) { }

    beforeEventEdit(event: any): boolean {
        const
            { eventRecord, resourceRecord, eventEdit } = event,
            editorConfig = new MatDialogConfig();

        Object.assign(editorConfig, {
            disableClose : false,
            autoFocus    : true,
            width        : '500px',
            data         : {
                eventRecord,
                resourceRecord,
                eventStore : eventEdit.eventStore
            }
        });

        // console.log('data=', editorConfig.data);
        this.editor.open(EventEditorComponent, editorConfig);

        // suppress default event editor
        return false;
    }

    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
        // install beforeEventEdit listener
        this.scheduler.on('beforeEventEdit', this.beforeEventEdit.bind(this));
    }

    /**
     * Custom event renderer for the scheduler
     */
    eventRenderer = ({ eventRecord }: { eventRecord: any }): string => {
        return `
            <div class="info">
                <div class="name">${eventRecord.name}</div>
                <div class="desc">${eventRecord.desc}</div>
            </div>
        `;
    }

}
