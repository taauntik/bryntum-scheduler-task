<template>
    <div class="scheduler-tab">
       <vuestic-widget class="b-scheduler-date-panel">
        <span class="b-scheduler-date-text">Scheduler date</span>
        <vuestic-date-picker
            ref="startDatePicker"
            :value="startDate"
            @input="onStartDatePickerInput"
        ></vuestic-date-picker>
        </vuestic-widget>
        <!--<vuestic-date-picker ref="endDatePicker" :value="endDate" @input="onEndDatePickerInput"></vuestic-date-picker>-->

        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerConfig"
            :startDate="startDate"
            @eventselectionchange="onEventSelectionChange"
        />
    </div>
</template>

<script>
import { BryntumScheduler } from '@bryntum/scheduler-vue';
import { DateHelper } from '@bryntum/scheduler';
import VuesticDatePicker from '../../../vuestic-theme/vuestic-components/vuestic-date-picker/VuesticDatePicker.vue';

export default {
    name : 'scheduler-tab',

    components : {
        BryntumScheduler,
        VuesticDatePicker
    },

    data() {
        return {
            startDate       : new Date(2018, 1, 7, 8),
            schedulerConfig : {
                timeRangesFeature : true,

                minHeight : '32em',

                resourceImagePath : 'users/',

                barMargin     : 5,
                endDate       : new Date(2018, 1, 7, 18),
                selectedEvent : '',
                eventStyle    : 'colored',

                crudManager : {
                    autoLoad  : true,
                    transport : {
                        load : {
                            url : 'data/data.json'
                        }
                    },
                    // This config enables response validation and dumping of found errors to the browser console.
                    // It's meant to be used as a development stage helper only so please set it to false for production systems.
                    validateResponse : true
                },

                columns : [
                    {
                        text   : 'Staff',
                        type   : 'resourceInfo',
                        width  : 120,
                        field  : 'name',
                        editor : false
                    },
                    {
                        text             : 'Type',
                        field            : 'role',
                        width            : 100,
                        editor           : {
                            type     : 'combo',
                            items    : ['CEO', 'CTO', 'Sales', 'Tech Sales', 'Developer', 'Design & UX'],
                            editable : false
                        },
                        responsiveLevels : {
                            medium : { hidden : true },
                            large  : { hidden : false }
                        }
                    }
                ],

                viewPreset : {
                    base    : 'hourAndDay',
                    headers : [
                        {
                            unit       : 'day',
                            align      : 'center',
                            dateFormat : 'dddd DD/MM/YY'
                        },
                        {
                            unit       : 'hour',
                            align      : 'center',
                            dateFormat : 'H:mm',
                            renderer(start) {
                                return `
                                    <div class="b-sch-header-hours">${DateHelper.format(start, 'H')}</div>
                                    <div class="b-sch-header-minutes">${DateHelper.format(start, 'mm')}</div>
                                `;
                            }
                        }
                    ]
                },

                eventRenderer({ eventRecord }) {
                    return `
                        <div class="info">
                            <div class="name">${eventRecord.name}</div>
                            <div class="desc">${eventRecord.desc}</div>
                        </div>
                        `;
                }
            }
        };
    },

    methods : {
        addEvent() {
            this.$refs.scheduler.addEvent();
        },

        removeEvent() {
            this.$refs.scheduler.removeEvent();
            this.selectedEvent = '';
        },

        onStartDatePickerInput(value) {
            const startDate = this.$refs.scheduler.instance.startDate;

            // convert string value to date object
            value = DateHelper.parse(value, 'YYYY-MM-DD');

            this.$refs.scheduler.instance.startDate = new Date(
                value.getFullYear(),
                value.getMonth(),
                value.getDate(),
                // apply start/end time from previous date value
                startDate.getHours(),
                startDate.getMinutes(),
                startDate.getSeconds()
            );
        },

        onEndDatePickerInput(value) {
            value = DateHelper.parse(value, 'Y-m-d');
            this.$refs.scheduler.instance.endDate = value;
        },

        onEventSelectionChange({ selection }) {
            if (selection.length) {
                this.selectedEvent = selection[0].name;
            }
            else {
                this.selectedEvent = '';
            }
        }
    },

    created() {
    }
};

</script>

<style>
    @import '~@bryntum/scheduler/scheduler.stockholm.css';

    .b-scheduler {
        border: #eeeeee 1px solid;
    }

    .b-scheduler-date-panel .vuestic-widget-body {
        display: flex;
        align-items:center;
    }

    .b-scheduler-date-text {
        flex: 1;
        text-align: right;
        padding-right: 0.5em;
    }

    .b-grid-header-container {
        border-bottom    : 2px solid #555;
        background-color : #fff;
    }

    .b-grid-header-text-content {
        display         : flex;
        justify-content : center;
    }

    .b-sch-header-text {
        display : inherit;
    }

    .b-grid-header,
    .b-sch-header-timeaxis-cell {
        background     : #fff;
        color          : #34495e;
        text-transform : uppercase;
        border-right   : none;
    }

    .b-sch-header-timeaxis-cell {
        border-bottom : 1px solid #999;
    }

    .b-sch-header-hours,
    .b-sch-header-minutes {
        line-height : 1em;
    }

    .b-sch-header-minutes {
        font-size : 0.5em;
    }

    .b-responsive-small .b-sch-header-minutes {
        display : none;
    }

    .b-resource-info dl {
        margin : 0;
    }

    .b-grid-vertical-overflow .b-grid-header-scroller:last-child,
    .b-columnlines .b-grid-cell:not(:last-child),
    .b-grid-cell {
        border-right : none;
    }

    .b-grid-row {
        border-bottom : 2px solid #eff4f5;
    }

    .b-grid-cell {
        color : #34495e;
    }

    .b-resource-info dd {
        color : #adb3b9;
    }

    .b-grid-splitter {
        background : transparent;
    }

    .b-sch-style-colored.b-sch-color-blue.b-sch-event:not(.b-sch-event-milestone),
    .b-sch-style-colored.b-sch-color-blue .b-sch-event:not(.b-sch-event-milestone) {
        color : #114fad;
    }

    .b-sch-style-colored.b-sch-color-green.b-sch-event:not(.b-sch-event-milestone),
    .b-sch-style-colored.b-sch-color-green .b-sch-event:not(.b-sch-event-milestone) {
        color : #326547;
    }

    .b-sch-style-colored.b-sch-color-red.b-sch-event:not(.b-sch-event-milestone),
    .b-sch-style-colored.b-sch-color-red .b-sch-event:not(.b-sch-event-milestone) {
        color : #a23838;
    }

</style>
