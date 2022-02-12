/**
 * Custom, Angular-based event editor implementation
 */
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector    : 'custom-event-editor',
    templateUrl : './event-editor.component.html',
    styleUrls   : ['./event-editor.component.scss']
})
export class EventEditorComponent {
    name: string;
    desc: string;
    startDate: Date;
    endDate: Date;
    eventRecord: any;
    eventStore: any;
    resourceId: any;

    constructor(
        private dialogRef: MatDialogRef<EventEditorComponent>,
        @Inject(MAT_DIALOG_DATA) data: any
    ) {
        if (data) {
            if (data.eventRecord) {
                Object.assign(this, {
                    name        : data.eventRecord.name,
                    desc        : data.eventRecord.desc,
                    startDate   : new Date(data.eventRecord.startDate),
                    endDate     : new Date(data.eventRecord.endDate),
                    eventRecord : data.eventRecord,
                    resourceId  : data.resourceRecord.id,
                    eventStore  : data.eventStore
                });
            }
        }
    }

    save(): void {
        const eventRecord = this.eventRecord;

        // Reset this flag to tell EventEdit feature that this is a real record
        eventRecord.isCreating = false;

        const data = {
            name      : this.name,
            desc      : this.desc || '',
            startDate : this.startDate,
            endDate   : this.endDate,
            iconCls   : this.eventRecord.iconCls || 'b-fa b-fa-calendar'
        };
        if (!eventRecord.eventStore) {
            this.eventStore.add(eventRecord);
        }
        eventRecord.set(data);
        eventRecord.resourceId = this.resourceId;

        this.dialogRef.close();
    }

    close(): void {
        const { eventRecord } = this;

        // Remove the eventRecord if user pressed cancel after creating the event
        if (eventRecord.isCreating) {
            eventRecord.isCreating = false;
            eventRecord.eventStore.remove(eventRecord);
            this.eventRecord = null;
        }
        this.dialogRef.close();
    }
}
