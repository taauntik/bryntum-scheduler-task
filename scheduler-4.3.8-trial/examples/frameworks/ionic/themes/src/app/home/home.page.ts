import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { DomHelper, Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import { schedulerConfig } from '../app.config';

@Component({
    selector    : 'app-home',
    templateUrl : 'home.page.html',
    styleUrls   : ['home.page.scss']
})
export class HomePage implements AfterViewInit {

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    schedulerConfig: any = schedulerConfig;

    // application properties
    scheduler: Scheduler;

    themes = [
        'Stockholm',
        'Classic',
        'Classic-Light',
        'Classic-Dark',
        'Material'
    ];

    theme = this.themes[0];

    private themeClass = () => `b-theme-${this.theme.toLowerCase()}`;

    constructor(private route: ActivatedRoute) {
    }

    ngAfterViewInit(): void {
        this.scheduler = this.schedulerComponent.instance;
    }

    ngOnInit(): void {
        // Get initial theme from theme queryParams
        if (this.route.snapshot.queryParams.theme) {
            this.onSetTheme({ value : this.route.snapshot.queryParams.theme });
        }
    }

    onSetTheme({ value }): void {
        DomHelper.setTheme(value);
        // Store theme class name on body to reflect changes
        DomHelper.removeClasses(document.body, [this.themeClass()]);
        this.theme = value;
        DomHelper.addClasses(document.body, [this.themeClass()]);
    }
}
