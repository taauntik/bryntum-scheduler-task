/**
 * DateTime field component
 *
 * Combined date and time fields and pickers to form the date-time field
 * Two-way bindable
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import format from 'date-fns/format';

@Component({
    selector    : 'date-time-field',
    templateUrl : './date-time-field.component.html',
    styleUrls   : ['./date-time-field.component.scss']
})

export class DateTimeFieldComponent implements OnInit {

    // bindable properties
    @Input() value: Date;
    @Input() fieldLabel: string;

    // value change event emitter
    @Output() valueChange: EventEmitter<Date> = new EventEmitter();

    // time selector is bound here
    timeValue: string;

    /**
     * Initializes timeValue
     */
    ngOnInit(): void {
        this.timeValue = format(this.value, 'HH:mm');
    }

    /**
     * Called when date changes. Sets year, month and date of the value
     * @param event change event
     */
    onDateChange(event: any): void {
        const value = this.value;

        value.setFullYear(event.value.getFullYear());
        value.setMonth(event.value.getMonth());
        value.setDate(event.value.getDate());

        this.valueChange.emit(value);

    }

    /**
     * Called when time changes. Sets hours and minutes of the value
     * @param event change event
     */
    onTimeChange(event: any): void {
        const hoursMinutes = event.value.split(':'),
            value = this.value
        ;

        value.setHours(hoursMinutes[0]);
        value.setMinutes(hoursMinutes[1]);
        this.valueChange.emit(value);

    }

}
