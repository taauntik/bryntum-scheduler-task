/**
 * Angular app component script
 */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AppActions from './store/app.actions';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {

    // button pressed flags (for initialization only)
    isPressed1 = true;
    isPressed2 = false;

    // store slice observable
    barMargin: Observable<{ barMargin: number }>

    // inject router and store
    constructor(
        public router: Router,
        public store: Store<{
            barMargin: { barMargin: number }
        }>
    ) { }

    onBarMarginChange = (value: number): void => {
        this.store.dispatch(new AppActions.BarMarginChange(value));
    }

    ngAfterViewInit(): void {
    }

    ngOnInit(): void {
        // Get barMargin Observable from the store
        this.barMargin = this.store.select('barMargin');

        // we need to set one of the buttons pressed on app start
        // depending on what is the current url
        const setPressed = (event: Event) => {
            if (event instanceof NavigationEnd) {
                this.updateButtonState(event.url);
                // we do not need to keep subscribed after first run
                subscription.unsubscribe();
            }
        };
        // needed to be able to unsubscribe after the first run
        const subscription = this.router.events.subscribe(setPressed);
    }

    updateButtonState(url: string): void {
        this.isPressed2 = url === '/scheduler2';
        this.isPressed1 = !this.isPressed2;
    }

    navigate(url: string): void {
        this.updateButtonState(url);
        this.router.navigate([url]);
    }
}
