/**
 * Application routing module
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Scheduler1Component } from './scheduler1/scheduler1.component';
import { Scheduler2Component } from './scheduler2/scheduler2.component';

const routes: Routes = [
    { path : 'scheduler1', component : Scheduler1Component },
    { path : 'scheduler2', component : Scheduler2Component },
    { path : '**',   redirectTo : '/scheduler1', pathMatch : 'full' }
];

@NgModule({
    imports : [RouterModule.forRoot(routes, {
    // enableTracing: true, // <-- debugging purposes only
        useHash                : true, // Use hash to avoid 404 issue in live demos    
        relativeLinkResolution : 'legacy'
    })],
    exports : [RouterModule]
})

export class AppRoutingModule { }
