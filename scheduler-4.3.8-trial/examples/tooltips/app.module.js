import { StringHelper, DateHelper, AjaxHelper, TabPanel } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const tabPanel = new TabPanel({
    appendTo : 'container',
    items    : [
        {
            type        : 'scheduler',
            title       : 'Local tooltips',
            startDate   : new Date(2017, 0, 1, 6),
            endDate     : new Date(2017, 0, 1, 20),
            viewPreset  : 'hourAndDay',
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
            features : {
                eventDrag : {
                    // Custom tooltip for when an event is dragged
                    tooltipTemplate : ({ eventRecord, startDate }) => {
                        return StringHelper.xss`<h4 style="margin:0 0 1em 0">Custom drag drop tooltip</h4>
                        <div style="margin-bottom:0.8em">${eventRecord.name}</div>
                        <i style="margin-right:0.5em" class="b-icon b-icon-clock"></i>${DateHelper.format(startDate, 'HH:mm')}
                    `;
                    }
                },

                eventResize : {
                    // A minimal end date tooltip when resizing
                    tooltipTemplate : ({ record, endDate }) => {
                        return DateHelper.format(endDate, 'HH:mm');
                    }
                },

                eventTooltip : {
                    tools : [
                        {
                            cls     : 'b-fa b-fa-cut',
                            handler : function() {
                                this.eventRecord.split();
                                this.hide();
                            }
                        },
                        {
                            cls     : 'b-fa b-fa-trash',
                            handler : function() {
                                this.eventRecord.remove();
                                this.hide();
                            }
                        },
                        {
                            cls     : 'b-fa b-fa-angle-left',
                            handler : function() {
                                this.eventRecord.shift(-1);
                            }
                        },
                        {
                            cls     : 'b-fa b-fa-angle-right',
                            handler : function() {
                                this.eventRecord.shift(1);
                            }
                        }
                    ],

                    header : {
                        titleAlign : 'start'
                    },

                    onBeforeShow({ source : tooltip }) {
                        tooltip.title = StringHelper.encodeHtml(tooltip.eventRecord.name);
                    },

                    template : data => `<dl>
                        <dt>Assigned to:</dt>
                        <dd>
                             ${data.eventRecord.resource.get('image') ? `<img class="resource-image" src="../_shared/images/users/${data.eventRecord.resource.get('image')}"/>` : ''}
                             ${StringHelper.encodeHtml(data.eventRecord.resource.name)}
                        </dd>
                        <dt>Time:</dt>
                        <dd>
                            ${DateHelper.format(data.eventRecord.startDate, 'LT')} - ${DateHelper.format(data.eventRecord.endDate, 'LT')}
                        </dd>
                        ${data.eventRecord.get('note') ? `<dt>Note:</dt><dd>${data.eventRecord.note}</dd>` : ''}

                        ${data.eventRecord.get('image') ? `<dt>Image:</dt><dd><img class="image" src="${data.eventRecord.get('image')}"/></dd>` : ''}
                    </dl>
                    `
                    // You can also use Tooltip configs here, for example:
                    // anchorToTarget : false,
                    // trackMouse     : true
                }
            },

            columns : [
                { text : 'Name', field : 'name', width : 130 }
            ]
        },
        {
            type        : 'scheduler',
            title       : 'Remotely loaded tooltips',
            startDate   : new Date(2017, 0, 1, 6),
            endDate     : new Date(2017, 0, 1, 20),
            viewPreset  : 'hourAndDay',
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : 'data/data.json'
                    }
                }
            },
            features : {
                eventTooltip : {
                    template : ({ eventRecord }) => AjaxHelper.get(`./fakeServer?name=${eventRecord.name}`).then(response => response.responseText)
                }
            },

            columns : [
                { text : 'Name', field : 'name', width : 130 }
            ]
        }
    ]
});

// DEMO ONLY: Mock a server endpoint fetching data to be shown in the async column
AjaxHelper.mockUrl('./fakeServer', (url, params) => {
    return {
        delay        : 1500,
        responseText : `<dl>
        <dt>${StringHelper.encodeHtml(params.name)}:</dt>
        <dt>Additional info:</dt>
        <dd>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </dd>
    </dl>`
    };
});
