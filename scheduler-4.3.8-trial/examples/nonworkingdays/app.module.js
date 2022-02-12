import { Scheduler, ResourceModel, DateHelper, LocaleManager } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

class Property extends ResourceModel {
    static get fields() {
        return [
            // Using icons for resources
            {
                name         : 'image',
                defaultValue : false
            }
        ];
    }
}

const scheduler = new Scheduler({
    appendTo : 'container',

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 20),
    barMargin : 10,
    rowHeight : 60,

    viewPreset : 'weekAndDayLetter',

    features : {
        // Shade non-working days
        nonWorkingTime : true,

        scheduleTooltip : {
            // Hide schedule tooltip when hovering non-working days
            hideForNonWorkingTime : true
        }
    },

    // CrudManager loads all data from a single source
    crudManager : {
        resourceStore : {
            modelClass : Property
        },

        autoLoad : true,

        transport : {
            load : {
                url : 'data/data.json'
            }
        },

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type : 'resourceInfo', width : 200 }
    ],

    tbar : [
        '->',
        {
            type : 'widget',
            cls  : 'b-has-label',
            html : '<label>Non-working days</label>'
        },
        {
            type     : 'buttongroup',
            ref      : 'nonWorkingDays',
            defaults : {
                cls        : 'b-raised',
                toggleable : true
            },
            items : DateHelper.getDayShortNames().map((name, index) => {
                return {
                    text    : name,
                    pressed : DateHelper.nonWorkingDays[index],
                    index
                };
            }),
            listeners : {
                click : 'up.onNonWorkingDayChange'
            }
        }
    ],

    onNonWorkingDayChange() {
        const
            // Collect an array of pressed button indices
            values = this.widgetMap.nonWorkingDays.items.filter(button => button.pressed).map(button => button.index),
            // Convert array [0, 6] to object { 0 : true, 6 : true } for example
            days   = values.reduce((acc, day) => {
                acc[day] = true;
                return acc;
            }, {});

        // Update nonWorkingDays in current locale
        LocaleManager.locale.DateHelper.nonWorkingDays = days;

        // Force-apply current locale to update non-working intervals
        LocaleManager.applyLocale(LocaleManager.locale.localeName, true);
    },

    listeners : {
        paint : ({ firstPaint, source }) => {
            // Update widget buttons on locale change
            if (firstPaint) {
                LocaleManager.on({
                    locale() {
                        const
                            days               = DateHelper.getDayShortNames(),
                            weekends           = DateHelper.nonWorkingDays,
                            { nonWorkingDays } = this.widgetMap;

                        nonWorkingDays.suspendEvents();

                        nonWorkingDays.eachWidget(button => {
                            button.text    = days[button.index];
                            button.pressed = weekends[button.index];
                        });

                        nonWorkingDays.resumeEvents();
                    },
                    thisObj : source
                });
            }
        }
    }
});
