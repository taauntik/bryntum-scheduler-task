import { Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-event' },

            (next, el) => {
                scheduler = bryntum.fromElement(el[0], 'scheduler');
                next();
            },

            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('Should not crash when toggling layout', t => {
        t.chain(
            // should not crash
            { click : 'button:contains(Overlap)' },
            { click : 'button:contains(Pack)' },
            { click : 'button:contains(Stack)' }
        );
    });

    t.it('Custom sorter should be applied', t => {
        t.chain(
            { click : '[data-ref=customButton]' },

            {
                waitFor : () => {
                    const box = Rectangle.from(document.querySelector('[data-event-id="3"]'), bryntum.query('scheduler').timeAxisSubGridElement);
                    return box.top === 1;
                },
                desc : 'Meeting #3 moved to top'
            }
        );
    });
});
