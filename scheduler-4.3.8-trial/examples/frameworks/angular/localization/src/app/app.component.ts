/**
 * App component script
 */
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { LocaleManager, Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
import './schedulerLocales.js';
import { schedulerConfig } from './app.config';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    currentLanguage = 'en';
    t: any;

    public schedulerConfig: any = schedulerConfig;
    private scheduler: Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : true }) schedulerComponent: BryntumSchedulerComponent;

    constructor(@Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService) {
        this.t = i18NextService.t;
    }

    /**
     * Set the current language
     */
    ngOnInit(): void {
        this.i18NextService.events.initialized.subscribe(e => {
            if (e) {
                this.currentLanguage = this.i18NextService.language;
            }
        });
    }

    /**
     * Set the scheduler language after it is initialized
     */
    ngAfterViewInit(): void {
        // Store Scheduler instance
        this.scheduler = this.schedulerComponent.instance;
        this.applySchedulerLocale(this.i18NextService.language);
    }

    /**
     * Changes the language of the application
     * @param lang language name
     */
    changeLanguage(lang: string): void {
        const me = this;

        me.applySchedulerLocale(lang);

        if (lang !== me.i18NextService.language) {
            me.i18NextService.changeLanguage(lang).then(x => {
                me.currentLanguage = lang;
            });
        }
    }

    /**
     * @param schedulerLocale
     * Applies scheduler locale. Called always when
     * locale changes by SettingContext setLocale
     */
    applySchedulerLocale = (schedulerLocale: string): void => {
        switch (schedulerLocale) {
            case 'se':
                LocaleManager.locale = 'SvSE';
                break;

            case 'ru':
                LocaleManager.locale = 'Ru';
                break;

            default:
                LocaleManager.locale = 'En';
                break;
        }
    }

}
