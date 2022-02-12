/**
 * Scheduler 1 script file
 */
import { Component, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { scheduler1Config } from './scheduler1.config';

@Component({
    selector    : 'app-scheduler1',
    templateUrl : './scheduler1.component.html'
})
export class Scheduler1Component implements AfterViewInit, OnDestroy {

    schedulerConfig: any = scheduler1Config;
    scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public store: Store<{ barMargin: { barMargin: number } }>
    ) {
    }

    ngAfterViewInit(): void {
        // console.log('initialize scheduler 1');
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
        // console.log('destroying scheduler1');
    }

}
