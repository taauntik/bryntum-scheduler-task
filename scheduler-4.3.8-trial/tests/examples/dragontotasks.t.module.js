StartTest(t => {
    const
        scheduler = bryntum.query('schedule'),
        equipment = bryntum.query('equipmentgrid');

    //  TODO remove when this is fixed: https://app.assembla.com/spaces/bryntum/tickets/8772-scheduletooltip-should-reposition-itself-upon-hover-over-it/details#
    scheduler.features.scheduleTooltip.disabled = true;

    t.it('sanity', t => {
        t.chain(
            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('Should be able to drag equipment from grid onto a task', t => {
        const equipmentStore = equipment.store;
        const eventStore     = scheduler.eventStore;

        t.chain(
            // Wait for initial data is set to stores (otherwise 'change' event is fired with 'dataset' action in IE11)
            { waitFor : () => eventStore.count === 6 && equipmentStore.count === 9 },
            { waitForSelector : scheduler.eventSelector + '[data-event-id="r3"]' },

            async() => {
                t.willFireNTimes(eventStore, 'change', 2);
                t.wontFire(equipmentStore, 'change');
            },

            {
                drag : '.b-equipment:contains(Video camera)',
                to   : scheduler.eventSelector + '[data-event-id="r3"]'
            },

            {
                drag : '.b-equipment:contains(Microphone)',
                to   : scheduler.eventSelector + '[data-event-id="r3"]'
            },

            async() => {
                t.selectorExists(scheduler.eventSelector + '[data-event-id="r3"] .b-fa.b-fa-video', 'Video icon rendered');
                t.selectorExists(scheduler.eventSelector + '[data-event-id="r3"] .b-fa.b-fa-microphone', 'Microphone icon rendered');
            },

            { dblClick : '[data-event-id="r3"]' },

            async() => {
                const equipmentCombo = scheduler.features.eventEdit.getEditor().widgetMap.equipment;
                t.is(equipmentCombo.store.count, 9, 'Equipment store has correct contents');
            },

            { click : '.b-button:contains(Cancel)' }
        );
    });

    t.it('Dragging to invalid place should have no side effect on data', t => {
        const equipmentStore = equipment.store;
        const eventStore = scheduler.eventStore;

        t.wontFire(equipmentStore, 'change');
        t.wontFire(eventStore, 'change');

        t.chain(
            {
                drag : '[data-ref=equipment] .b-grid-cell',
                to   : '[data-ref=schedule] .b-grid-row:nth-child(6) .b-sch-timeaxis-cell'
            }
        );
    });

    t.it('Should not crash when filtering equipment grid and dragging onto task', t => {
        const eventStore = scheduler.eventStore;

        t.chain(
            { click : '.b-filter-bar-field' },
            { type : 'tool' },
            { waitForSelector : '[data-ref=equipment] .b-grid-row[data-index="0"] .b-grid-cell:contains(Toolbox)' },
            {
                drag : '[data-ref=equipment] .b-grid-cell',
                to   : scheduler.eventSelector + ':contains(CLASSIFIED)'
            },
            () => {
                const classifiedEvent = eventStore.getById('r3');

                t.is(classifiedEvent.equipment.length, 4, '4 items added to event');
            }
        );
    });
});
