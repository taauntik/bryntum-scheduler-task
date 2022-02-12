/**
 * Scheduler 2 script file
 */
import { Component, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';

import { scheduler2Config } from './scheduler2.config';

@Component({
    selector    : 'app-scheduler2',
    templateUrl : './scheduler2.component.html'
})
export class Scheduler2Component implements AfterViewInit, OnDestroy {

    schedulerConfig: any = scheduler2Config;
    scheduler: Scheduler;

    @ViewChild('scheduler2', { static : true }) schedulerComponent: BryntumSchedulerComponent;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public store: Store<{ barMargin: { barMargin: number } }>
    ) {
    }

    ngAfterViewInit(): void {
        // console.log('initialize scheduler 2');
        this.scheduler = this.schedulerComponent.instance;

        const saveState = (event: Event) => {
            if (event instanceof NavigationStart) {
                if (this.router.isActive(this.route.routeConfig.path, true)) {
                    this.scheduler.storeScroll();
                }
            }
            else if (event instanceof NavigationEnd) {
                if (this.router.isActive(this.route.routeConfig.path, true)) {
                    this.scheduler.restoreScroll();
                }
            }
        };

        this.router.events.subscribe(saveState);
    }

    ngOnDestroy(): void {
        // console.log('destroying scheduler 2');
    }

}
