/**
 * Angular reuse strategy script
 *
 * Implements reuse strategy to prevent destroying of schedulers on routing
 */
import {
    RouteReuseStrategy,
    ActivatedRouteSnapshot,
    DetachedRouteHandle
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class MyReuseStrategy implements RouteReuseStrategy {

    handlers: {[key: string]: DetachedRouteHandle} = {};

    getKey(route: ActivatedRouteSnapshot): string {
        return route.url[0] ? route.url[0].path : '';
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // console.log('shouldDetach', route);
        return true;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        // console.log('store', route);
        this.handlers[this.getKey(route)] = handle;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const attach = !!route.routeConfig && !!this.handlers[this.getKey(route)];
        // console.log('shouldAttach', route, attach);
        return attach;
    }

    retrieve(route: ActivatedRouteSnapshot): null | DetachedRouteHandle {
        const retrieved = this.handlers[this.getKey(route)];
        // console.log('retrieve', retrieved, route.routeConfig);
        if (!route.routeConfig) {
            return null;
        }
        return retrieved;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
        // console.log('shouldReuseRoute', this.getKey(future), this.getKey(current));
        return this.getKey(future) === this.getKey(current);
    }

}
