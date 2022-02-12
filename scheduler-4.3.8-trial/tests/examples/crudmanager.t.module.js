StartTest(t => {

    // Use unique cookie session ID per test
    t.setRandomPHPSession();

    const
        scheduler = bryntum.query('scheduler'),
        {
            crudManager,
            eventStore,
            assignmentStore,
            resourceStore
        } = scheduler,
        clickResetButton  = {
            waitForEvent : [crudManager, 'load'],
            trigger      : { click : '.b-button[data-ref="resetButton"]' },
            desc         : 'Data is reset'
        },
        clickLoadButton = {
            waitForEvent : [crudManager, 'load'],
            trigger      : { click : '.b-button[data-ref="reloadButton"]' },
            desc         : 'Data is loaded'
        };

    t.it('Should work with single-assigned events', t => {
        t.chain(
            clickResetButton,
            { waitForSelector : '[data-ref="crudStatus"]:contains(Data loaded)', desc : 'Status bar is correct' },
            {
                waitForEvent : [crudManager, 'sync'],
                trigger      : () => {
                    eventStore.add({
                        name      : 'New added event',
                        startDate : eventStore.last.startDate,
                        endDate   : eventStore.last.endDate
                    });
                    assignmentStore.add([
                        {
                            eventId    : eventStore.last.id,
                            resourceId : resourceStore.last.id
                        }
                    ]);
                }
            },
            { waitForSelector : '[data-ref="crudStatus"]:contains(Changes saved)', desc : 'Status bar is correct' },
            { waitForSelector : '[data-event-id="10"]', desc : 'Added event is rendered' },

            clickLoadButton,
            { waitForSelector : '[data-ref="crudStatus"]:contains(Data loaded)', desc : 'Status bar is correct' },
            { waitForSelector : '[data-event-id="10"]', desc : 'Added event is still rendered' },

            clickResetButton,
            { waitForSelector : '[data-ref="crudStatus"]:contains(Data loaded)', desc : 'Status bar is correct' },
            { waitForSelectorNotFound : '[data-event-id="10"]:not(.b-released)', desc : 'Added event is removed' }
        );
    });

    t.it('Should work with multi-assigned events', t => {
        t.chain(
            clickResetButton,
            { waitForSelector : '[data-ref="crudStatus"]:contains(Data loaded)', desc : 'Status bar is correct' },
            { waitForSelector : '[data-event-id="9"][data-resource-id="2"]', desc : 'Multi-assigned event exists on resource 2' },
            { waitForSelector : '[data-event-id="9"][data-resource-id="5"]', desc : 'Multi-assigned event exists on resource 5' },
            {
                waitForEvent : [crudManager, 'sync'],
                trigger      : () => {
                    eventStore.add({
                        name      : 'New added event (multi-assigned)',
                        startDate : eventStore.last.startDate,
                        endDate   : eventStore.last.endDate
                    });
                    const eventId = eventStore.last.id;
                    assignmentStore.add([
                        { eventId, resourceId : 1 },
                        { eventId, resourceId : 2 },
                        { eventId, resourceId : 3 }
                    ]);
                },
                desc : 'Adding new multi-assigned event'
            },
            { waitForSelector : '[data-ref="crudStatus"]:contains(Changes saved)', desc : 'Status bar is correct' },
            { waitForSelector : '[data-event-id="10"][data-resource-id="1"]', desc : 'New multi-assigned event exists on resource 1' },
            { waitForSelector : '[data-event-id="10"][data-resource-id="2"]', desc : 'New multi-assigned event exists on resource 2' },
            { waitForSelector : '[data-event-id="10"][data-resource-id="3"]', desc : 'New multi-assigned event exists on resource 3' },

            { dblClick : '[data-event-id="10"]', desc : 'Show Event edit for event' },
            { click : '.b-chip .b-icon-clear', desc : 'Removing resource 1 assignment' },

            {
                waitForEvent : [crudManager, 'sync'],
                trigger      : { click : 'button:contains(Save)' }
            },
            { waitForSelectorNotFound : '[data-event-id="10"][data-resource-id="1"]:not(.b-released)', desc : 'New multi-assigned event removed from resource 1' },
            { waitForSelector : '[data-event-id="10"][data-resource-id="2"]', desc : 'New multi-assigned event exists on resource 2' },
            { waitForSelector : '[data-event-id="10"][data-resource-id="3"]', desc : 'New multi-assigned event exists on resource 3' }
        );
    });

    // https://github.com/bryntum/support/issues/404
    t.it('Should allow to save edited event with now errors', t => {
        t.chain(
            clickResetButton,
            { waitForSelector : '[data-ref="crudStatus"]:contains(Data loaded)', desc : 'Status bar is correct' },
            { dblclick : '[data-event-id=3]' },
            { click : '.b-textfield input[name=name]' },
            { type : 'Test', clearExisting : true },
            { click : '.b-button:contains(Save)' }
        );
    });

});
