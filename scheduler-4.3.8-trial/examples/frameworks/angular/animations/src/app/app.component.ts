/**
 * App component script
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { DateHelper, Menu, Scheduler, TimeSpan } from '@bryntum/scheduler/scheduler.lite.umd.js';
import AppEventModel from './lib/AppEventModel';
import { schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {

    public schedulerConfig = schedulerConfig;
    private styleNode: HTMLStyleElement = document.createElement('style');
    private scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;

    /**
     * Runs after the view (including the child scheduler) is initializes
     */
    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
        this.setAnimationDuration(600);
    }

    /**
     * Runs on this component initialization
     */
    ngOnInit(): void {
        document.head.appendChild(this.styleNode);
    }

    /**
     * Sets the duration of animation.
     */
    setAnimationDuration(value: number): void {
        this.scheduler.transitionDuration = value;
        this.styleNode.innerHTML = `.b-grid-row,.b-sch-event-wrap { transition-duration: ${value / 1000}s !important; }`;
    }

    /**
     * Initial animation button click handler
     */
    onInitialAnimation = ({ source }) => {
        const { scheduler } = this;

        function play(animation: any) {
            scheduler.restartInitialAnimation(animation);
        }

        new Menu({
            forElement  : source.element,
            closeAction : 'destroy',
            width       : source.element.offsetWidth,
            items       : [
                {
                    text     : 'Fade in',
                    icon     : 'b-fa b-fa-play',
                    disabled : scheduler.useInitialAnimation === 'fade-in',
                    onItem   : () => play('fade-in')
                },
                {
                    text     : 'Slide from left',
                    icon     : 'b-fa b-fa-play',
                    disabled : scheduler.useInitialAnimation === 'slide-from-left',
                    onItem   : () => play('slide-from-left')
                },
                {
                    text     : 'Slide from top',
                    icon     : 'b-fa b-fa-play',
                    disabled : scheduler.useInitialAnimation === 'slide-from-top',
                    onItem   : () => play('slide-from-top')
                },
                {
                    text     : 'Zoom in',
                    icon     : 'b-fa b-fa-play',
                    disabled : scheduler.useInitialAnimation === 'zoom-in',
                    onItem   : () => play('zoom-in')
                },
                {
                    text     : 'Custom',
                    icon     : 'b-fa b-fa-play',
                    cls      : 'b-separator',
                    disabled : scheduler.useInitialAnimation === 'custom',
                    onItem   : () => play('custom')
                }
            ],
            listeners : {
                destroy() {
                    source.pressed = false;
                }
            }
        });
    }

    /**
     * Random update button click handler
     */
    onRandomUpdate = () => {
        const
            { scheduler } = this,
            eventStore = scheduler.eventStore,
            indices = [],
            nbrToAnimate = Math.min(eventStore.count, 4);

        // Grab a bunch of random events to change
        while (indices.length < nbrToAnimate) {
            const index = Math.floor(Math.random() * eventStore.count);

            if (!indices.includes(index)) {
                indices.push(index);
            }
        }
        indices.forEach((index) => {
            const ev: any = eventStore.getAt(index);

            if (ev && ev.resource) {
                ev.beginBatch();
                ev.resourceId = (scheduler.resourceStore.indexOf(ev.resource) + 2) % 8 + 1;
                ev.setStartDate(DateHelper.add(ev.startDate, ev.startDate.getHours() % 2 ? 1 : -1, 'hour'), true);
                ev.endBatch();
            }
        });

    }

    /**
     * After lunch button click handler. Moves all meetings after lunch.
     */
    onAfterLunch(): void {
        const
            { scheduler } = this,
            eventStore = scheduler.eventStore,
            lunchFinishTime = (scheduler.features.timeRanges.store.getById('lunch') as TimeSpan).endDate;

        eventStore.query((event: AppEventModel) => event.eventType === 'Meeting')
            .forEach((event: AppEventModel) => event.startDate = DateHelper.max(event.startDate as Date, lunchFinishTime as Date));

    }

    /**
     * Max 1 hr button click handler. Resizes all Meeting to be max 1 hr long.
     */
    onMaxHour(): void {
        const { scheduler } = this;
        scheduler.eventStore.query((event: AppEventModel) => event.eventType === 'Meeting')
            .forEach((event: AppEventModel) => event.duration = Math.min(event.duration, 1));
    }

    /**
     * Duration slider change handler
     */
    onDurationChange({ value }): void {
        this.setAnimationDuration(value);
    }

}
