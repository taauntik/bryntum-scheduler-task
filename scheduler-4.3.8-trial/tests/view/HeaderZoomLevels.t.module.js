import { PresetManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    t.diag('For visual inspection');

    PresetManager.forEach((preset, i) => {
        t.getScheduler({
            width     : 300,
            height    : 200,
            style     : 'float:left;margin-left:5px',
            columns   : [],
            resources : [],
            events    : []
        }).zoomToLevel(i);
    });
});
