import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular';
import { HomePage } from './home.page';

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path      : '',
                component : HomePage
            }
        ]),
        BryntumSchedulerModule
    ],
    declarations : [
        HomePage
    ]
})
export class HomePageModule {}
