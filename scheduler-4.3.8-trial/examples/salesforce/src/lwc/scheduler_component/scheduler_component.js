/* globals bryntum : true */
import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import SCHEDULER from "@salesforce/resourceUrl/bryntum_scheduler";
import {dependencies, events, resources} from './data';

export default class Scheduler_component extends LightningElement {
    renderedCallback() {
        if (this.bryntumInitialized) {
            return;
        }
        this.bryntumInitialized = true;

        Promise.all([
            loadScript(this, SCHEDULER + "/scheduler.lwc.module.js"),
            loadStyle(this, SCHEDULER + "/scheduler.stockholm.css")
        ])
            .then(() => {
                this.createScheduler();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Bryntum Scheduler",
                        message: error,
                        variant: "error"
                    })
                );
            });
    }

    createScheduler() {
        window.scheduler = new bryntum.scheduler.Scheduler({
            features: {
                stripe: true,
                dependencies: true,
                dependencyEdit: {
                    showLagField: false
                },
                timeRanges: true,
                eventDrag: {
                    constrainDragToResource: true
                }
            },
            appendTo: this.template.querySelector('.container'),
            rowHeight: 50,
            barMargin: 8,
            columns: [
                {
                    text: 'Production line',
                    width: 150,
                    field: 'name'
                }
            ],
            startDate: new Date(2017, 11, 1),
            endDate: new Date(2017, 11, 3),
            viewPreset : {
                base: 'hourAndDay',
                tickWidth: 25,
                columnLinesFor: 0,
                headers: [
                    {
                        unit: 'd',
                        align: 'center',
                        dateFormat: 'ddd DD MMM'
                    },
                    {
                        unit: 'h',
                        align: 'center',
                        dateFormat: 'HH'
                    }
                ]
            },
            eventRenderer({ eventRecord, resourceRecord, tplData }) {
                const bgColor = resourceRecord.bg || '';

                tplData.style = `background:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
                tplData.iconCls.add('b-fa', `b-fa-${resourceRecord.icon}`);

                return eventRecord.name;
            },
            resourceStore: new bryntum.scheduler.ResourceStore({
                data: resources
            }),
            eventStore: new bryntum.scheduler.EventStore({
                data: events
            }),
            dependencyStore: new bryntum.scheduler.DependencyStore({
                data: dependencies
            })
        });
    }
}
