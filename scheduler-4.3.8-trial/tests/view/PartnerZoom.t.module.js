import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let topScheduler, bottomScheduler;

    t.beforeEach(() => {
        topScheduler && topScheduler.destroy();
        bottomScheduler && bottomScheduler.destroy();
    });

    t.it('Should sync zoom level', t => {
        topScheduler = new Scheduler({
            appendTo  : document.body,
            startDate : '2010-01-01',
            width     : 800,
            height    : 300
        });

        bottomScheduler = new Scheduler({
            appendTo    : document.body,
            partner     : topScheduler,
            hideHeaders : true,
            width       : 800,
            height      : 300
        });

        const
            stepsIn  = [],
            stepsOut = [];

        function buildStep(zoomIn = true) {
            return [
                async() => {
                    t.diag(`Zooming ${zoomIn && 'in' || 'out'} from level ${topScheduler.zoomLevel}`);
                    topScheduler[zoomIn && 'zoomIn' || 'zoomOut']();
                },
                {
                    waitFor : () => Math.abs(topScheduler.scrollLeft - bottomScheduler.scrollLeft) < 1 &&
                        Math.abs(topScheduler.timeAxisViewModel.totalSize - bottomScheduler.timeAxisViewModel.totalSize) < 1,
                    desc : 'Waiting for scroll to sync'
                }
            ];
        }

        for (let i = 0, l = topScheduler.presets.count; i < l - 1; i++) {
            stepsIn.push.apply(stepsIn, buildStep());
            stepsOut.push.apply(stepsOut, buildStep(false));
        }

        t.chain(
            next => {
                t.waitForEvent(topScheduler.timeAxisSubGrid.scrollable, 'scrollEnd', next);
                topScheduler.zoomOutFull();
            },
            stepsIn,
            stepsOut
        );
    });
});
