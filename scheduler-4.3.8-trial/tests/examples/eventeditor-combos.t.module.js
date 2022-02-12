StartTest(t => {
    let scheduler;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next, el) => {
                scheduler = bryntum.fromElement(el[0], 'scheduler');
                next();
            },

            () => t.checkGridSanity(scheduler)
        );
    });

    // https://github.com/bryntum/support/issues/346
    t.it('Should be possible to change value in Rooms combo', t => {
        t.chain(
            { dblclick : '.b-sch-event-wrap[data-event-id="1"]' },

            { click : '.b-combo[data-ref="roomCombo"]' },

            { click : '.b-list-item[data-id="307"]' },

            { click : '.b-button[data-ref="saveButton"]' },

            () => {
                const rec = scheduler.eventStore.getById(1);
                t.ok(rec.isModified, 'Record is updated');
                t.is(rec.room, 307, 'Room is 307');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2021
    t.it('Should not throw exception on create task if no resource is available', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next) => {
                scheduler.resourceStore.removeAll();
                next();
            },

            { click : '.b-icon-add.b-icon' }
        );
    });
});
