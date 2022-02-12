import { Scheduler, DateHelper, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const
    // Normalizes agenda items on load by converting string dates to actual dates and by calculating start and end offsets
    // from the events startDate, to keep a relative position later on drag/resize
    normalizeAgendaItems = eventData => {
        eventData.startDate = DateHelper.parse(eventData.startDate);
        eventData.agenda?.forEach(nestedEvent => {
            nestedEvent.startDate = DateHelper.parse(nestedEvent.startDate);
            nestedEvent.endDate = DateHelper.parse(nestedEvent.endDate);
            // Calculate offsets, more useful for rendering in case event is dragged to a new date
            nestedEvent.startOffset = DateHelper.diff(eventData.startDate, nestedEvent.startDate);
            nestedEvent.endOffset = DateHelper.diff(nestedEvent.startDate, nestedEvent.endDate);
        });
    },

    // Updates nested events dates on resize, based on events startDate and offsets stored during normalization (above)
    refreshAgendaDates = eventRecord => {
        eventRecord.agenda?.forEach(nestedEvent => {
            nestedEvent.startDate = DateHelper.add(eventRecord.startDate, nestedEvent.startOffset);
            nestedEvent.endDate = DateHelper.add(eventRecord.startDate, nestedEvent.endOffset);
        });
    };

const scheduler = new Scheduler({
    appendTo : 'container',

    startDate         : new Date(2018, 8, 24, 7),
    endDate           : new Date(2018, 8, 25),
    viewPreset        : 'hourAndDay',
    rowHeight         : 60,
    barMargin         : 10,
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],

    features : {
        labels : {
            bottomLabel : 'name'
        },
        // Nested events have fixed content
        stickyEvents : false
    },

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        listeners : {
            // Will be called after data is fetched but before it is loaded into stores
            beforeLoadApply({ response }) {
                // Turn "nested event" dates into actual dates, to not have to process them each time during render
                response.events.rows.forEach(event => normalizeAgendaItems(event));
            }
        },
        eventStore : {
            listeners : {
                // When an events startDate changes we want to update the dates of the nested events too
                update({ record, changes }) {
                    if (changes.startDate) {
                        refreshAgendaDates(record);
                    }
                }
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // eventBodyTemplate is used to render markup inside an event. It is populated using data from eventRenderer()
    eventBodyTemplate : values => values.map(value => `
        <div class="nested" style="left: ${value.left}px;width: ${value.width}px">
            ${StringHelper.encodeHtml(value.name)}
        </div>
    `).join(''),

    // eventRenderer is here used to translate the dates of nested events into pixels, passed on to the eventBodyTemplate
    eventRenderer({ eventRecord, renderData }) {
        const
        // Note that during a resize, we have to use `eventRecord.get('startDate')` to get the current value.
        // The value is not properly updated until the resize finishes
            startDate = eventRecord.get('startDate'),
            // getCoordinateFromDate gives us a px value in time axis, subtract events left from it to be within the event
            dateToPx  = (date) => this.getCoordinateFromDate(date) - renderData.left;

        // Calculate coordinates for all nested events and put in an array passed on to eventBodyTemplate
        return (eventRecord.agenda || [eventRecord]).map(nestedEvent => ({
            left  : dateToPx(DateHelper.add(startDate, nestedEvent.startOffset)),
            width : dateToPx(DateHelper.add(startDate, nestedEvent.endOffset)),
            name  : nestedEvent.name
        }));
    }
});
