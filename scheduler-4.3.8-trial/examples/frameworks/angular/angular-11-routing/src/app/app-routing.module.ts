import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SchedulerComponent } from './scheduler/scheduler.component';

const routes: Routes = [
    { path : '', redirectTo : 'scheduler', pathMatch : 'full' },
    { path : 'home', component : HomeComponent  },
    { path : 'scheduler', component : SchedulerComponent }
];

@NgModule({
    imports : [RouterModule.forRoot(routes, { useHash : true })],
    exports : [RouterModule]
})
export class AppRoutingModule { }
