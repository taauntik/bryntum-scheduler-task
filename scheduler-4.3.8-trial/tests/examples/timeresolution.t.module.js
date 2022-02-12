import { Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler = bryntum.query('scheduler');

    t.it('sanity', t => {
        t.chain(
            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('Should render events on all zoom levels',  t => {
        t.chain(
            { waitForRowsVisible : scheduler },

            Array.from(Array(25)).map((a, i) =>
                [
                    next => {
                        scheduler.zoomLevel = i;
                        next();
                    },

                    { waitForSelector : scheduler.eventSelector + '.b-sch-color-lime:not(.b-sch-released)' },

                    next => {
                        const element = document.querySelector(scheduler.eventSelector + '.b-sch-color-lime:not(.b-sch-released) .b-sch-event'),
                            rect = Rectangle.from(element, document.body),
                            view = Rectangle.from(document.querySelector('.b-grid-subgrid-normal'), document.body);

                        t.ok(rect.intersect(view), 'Event in view at zoomLevel ' + i);

                        next();
                    }
                ]
            )
        );
    });
});
