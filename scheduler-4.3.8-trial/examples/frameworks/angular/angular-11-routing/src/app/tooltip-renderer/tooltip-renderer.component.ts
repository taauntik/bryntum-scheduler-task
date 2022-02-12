/**
 * Tooltip renderer component
 */
import { Component, Input } from '@angular/core';
@Component({
    selector : 'app-tooltip-renderer',
    template : `
         <div class="custom-tooltip">
         <h3>{{ name }}</h3>
         <h3><label>Resource: </label> <span>{{ resourceName }}</span></h3>
         <article><ng-content></ng-content></article>
         </div>
     `
})

export class TooltipRendererComponent {

    @Input() name : String;
    @Input() resourceName : String;

}
