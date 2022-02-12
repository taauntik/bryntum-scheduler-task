import { Scheduler, DomHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

//region Data

const resources = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda' },
        { id : 'r3', name : 'Don' },
        { id : 'r4', name : 'Karen' },
        { id : 'r5', name : 'Doug' },
        { id : 'r6', name : 'Peter' },
        { id : 'r7', name : 'Sam' },
        { id : 'r8', name : 'Melissa' },
        { id : 'r9', name : 'Peter' },
        { id : 'r10', name : 'Anaya' }
    ],
    events    = [
        {
            id         : 'e1',
            resourceId : 'r1',
            startDate  : new Date(2019, 0, 10, 10),
            endDate    : new Date(2019, 0, 10, 12),
            name       : 'Default styling'
        },
        {
            id          : 'e2',
            resourceId  : 'r2',
            startDate   : new Date(2019, 0, 10, 12),
            endDate     : new Date(2019, 0, 10, 13, 30),
            name        : 'Custom red fill and blue stroke',
            roughConfig : {
                fill         : 'red',
                stroke       : 'blue',
                hachureAngle : 60,
                hachureGap   : 10,
                fillWeight   : 5,
                strokeWidth  : 5
            }
        },
        {
            id         : 'e3',
            resourceId : 'r3',
            startDate  : new Date(2019, 0, 10, 14),
            endDate    : new Date(2019, 0, 10, 16),
            name       : 'Default styling with purple color',
            eventColor : 'purple'
        },
        {
            id          : 'e4',
            resourceId  : 'r4',
            startDate   : new Date(2019, 0, 10, 8),
            endDate     : new Date(2019, 0, 10, 11),
            name        : 'Custom solid transparent fill',
            roughConfig : {
                fill      : 'rgba(255,0,0,0.2)',
                fillStyle : 'solid',
                roughness : 2
            }
        },
        {
            id         : 'e5',
            resourceId : 'r5',
            startDate  : new Date(2019, 0, 10, 15),
            endDate    : new Date(2019, 0, 10, 17),
            name       : 'Default styling'
        },
        {
            id         : 'e6',
            resourceId : 'r6',
            startDate  : new Date(2019, 0, 10, 16),
            endDate    : new Date(2019, 0, 10, 19),
            name       : 'Default styling with red color',
            eventColor : 'red'
        },
        {
            id          : 'e7',
            resourceId  : 'r6',
            startDate   : new Date(2019, 0, 10, 6),
            endDate     : new Date(2019, 0, 10, 8),
            name        : 'Custom dotted green fill',
            roughConfig : {
                fill      : 'green',
                fillStyle : 'dots'
            }
        },
        {
            id         : 'e8',
            resourceId : 'r7',
            startDate  : new Date(2019, 0, 10, 9),
            endDate    : new Date(2019, 0, 10, 11),
            name       : 'Default styling'
        },
        {
            id          : 'e9',
            resourceId  : 'r8',
            startDate   : new Date(2019, 0, 10, 10),
            endDate     : new Date(2019, 0, 10, 13),
            name        : 'Custom cross-hatched orange fill',
            roughConfig : {
                fill      : 'orange',
                fillStyle : 'cross-hatch'
            }
        },
        {
            id          : 'e10',
            resourceId  : 'r9',
            startDate   : new Date(2019, 0, 10, 14),
            endDate     : new Date(2019, 0, 10, 16),
            name        : 'Custom really rough',
            roughConfig : {
                fill      : 'green',
                roughness : 3
            }
        },
        {
            id         : 'e11',
            resourceId : 'r10',
            startDate  : new Date(2019, 0, 10, 16),
            endDate    : new Date(2019, 0, 10, 19),
            name       : 'Default styling with blue color',
            eventColor : 'blue'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo   : 'container',
    startDate  : new Date(2019, 0, 10, 6),
    endDate    : new Date(2019, 0, 10, 20),
    viewPreset : 'hourAndDay',
    rowHeight  : 50,
    barMargin  : 5,

    // No default styling, Rough.js will be used for that below
    eventStyle : null,

    eventStore : {
        fields : ['roughConfig'],
        data   : events
    },
    resources,

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    eventRenderer() {
        // Dont want any text in the event
        return '';
    },

    listeners : {
        // Triggered when a event/task is rendered and its element is available. Since scheduler renders what is in view
        // it might happen initially or on scroll, and multiple times per event over time when scrolling around.
        renderEvent({ source : scheduler, eventRecord, resourceRecord, renderData, element }) {
            // Use Rough.js (https://github.com/pshihn/rough) to draw events with a sketchy look
            let { roughData } = element,
                { canvas, roughCanvas } = roughData || {},
                isNew = false;

            const { width, height } = renderData;

            // Create a rough.canvas upon first rendering the event, storing it for later retrieval
            if (!canvas) {
                roughData = element.roughData = {};
                canvas = roughData.canvas = DomHelper.createElement({
                    parent : element,
                    tag    : 'canvas',
                    style  : 'width: 100%'
                });
                // eslint-disable-next-line no-undef
                roughCanvas = roughData.roughCanvas = rough.canvas(canvas);

                // New canvas, no need to clear it further down
                isNew = true;
            }
            // Element already has a rough.canvas, but we clear event contents during render so have to re-add it
            else {
                if (!canvas.parentElement) {
                    element.appendChild(canvas);
                }
            }

            // Try to be smart about when to redraw the canvas, avoid redrawing as long as dimensions are the same and
            // element is still used for the same event record (Scheduler reuses event elements to boost performance)
            if (roughData.width !== width || roughData.height !== height || roughData.eventId !== eventRecord.id) {
                // Store info used to determine if redraw is needed, also make sure canvas size matches events
                roughData.width = canvas.width = width;
                roughData.height = canvas.height = height;
                roughData.eventId = eventRecord.id;
                canvas.style.height = height + 'px';

                // Clear anything previously drawn, unless it is a brand new canvas
                if (!isNew) {
                    roughCanvas.ctx.clearRect(0, 0, width, height);
                }

                // Draw a sketchy rectangle using either eventRecord.roughConfig for settings or events configured color
                roughCanvas.rectangle(3, 3, width - 6, height - 6, eventRecord.roughConfig || {
                    fill : eventRecord.eventColor || resourceRecord.eventColor || scheduler.eventColor
                });
            }
        }
    }
});
