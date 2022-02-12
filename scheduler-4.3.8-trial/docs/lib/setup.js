import * as Bundle from '../../build/scheduler.module.js';
import '../data/docs_scheduler.js';
import '../data/guides.js';

window.product = 'scheduler';
window.productName = 'Scheduler';
window.bryntum.silenceBundleException = true;

for (const clsName in Bundle) {
    window[clsName] = Bundle[clsName];
}
