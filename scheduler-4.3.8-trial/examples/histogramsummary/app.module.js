import { Scheduler } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';


const maxValue = 10;

new Scheduler({
    appendTo   : 'container',
    viewPreset : 'hourAndDay',
    eventColor : 'blue',
    features   : {
        summary : {
            renderer({ element, events }) {
                const value = events.length / maxValue;
                element.style.height = `${100 * value}%`;

                if (value > 0.5) {
                    element.classList.add('b-summarybar-label-inside');
                }
                else {
                    element.classList.remove('b-summarybar-label-inside');
                }

                return `<label>${events.length || ''}</label>`;
            }
        }
    },
    barMargin         : 15,
    startDate         : new Date(2017, 11, 1, 6),
    endDate           : new Date(2017, 11, 3),
    resourceImagePath : '../_shared/images/users/',

    columns : [
        {
            type            : 'resourceInfo',
            text            : 'Name',
            width           : 170,
            sum             : 'count',
            summaryRenderer : ({ sum }) => `Total: ${sum}`
        },
        {
            type            : 'number',
            text            : 'Rating',
            field           : 'rating',
            width           : 100,
            sum             : 'average',
            align           : 'right',
            summaryRenderer : ({ sum }) => `Average: ${sum.toFixed(2)}`
        }
    ],

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
    }
});
