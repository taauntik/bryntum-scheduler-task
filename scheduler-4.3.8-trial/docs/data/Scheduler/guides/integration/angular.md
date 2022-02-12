<h1 class="title-with-image"><img src="Core/logo/angular.svg" alt="Bryntum Scheduler supports Angular"/>
Using Bryntum Scheduler with Angular</h1>

## Bryntum NPM repository access

Please refer to this [guide for Bryntum NPM repository access](#Scheduler/guides/npm-repository.md).

## Bryntum Scheduler

The Bryntum Scheduler itself is framework agnostic, but it ships with demos and wrappers to simplify its use with popular
frameworks such as Angular. The purpose of this guide is to give you a basic introduction on how to use Bryntum Scheduler
with Angular.

## View online demos

Bryntum Scheduler Angular demos can be viewed in our
[online example browser](https://bryntum.com/examples/scheduler/#Integration/Angular).

## Build and run local demos

Angular demos are located in **examples/frameworks/angular** folder inside distribution zip.

Trial distribution zip can be requested from [https://bryntum.com](https://bryntum.com/products/scheduler)
by clicking **Free Trial** button. Licensed distribution zip is located at
[Bryntum Customer Zone](https://customerzone.bryntum.com).

Each demo contains bundled `README.md` file in demo folder with build and run instructions.

To view and run an example locally in development mode, you can use the following commands:

```shell
$ npm install
$ npm run start
```

That starts a local server accessible at [http://localhost:4200](http://localhost:4200). If
you modify the example code while running it locally it is automatically rebuilt and updated in the browser allowing you
to see your changes immediately.

The production version of an example, or your application, is built by running:

```shell
$ npm install
$ npm run build
```

The built version is then located in `dist` sub-folder which contains the compiled code that can be deployed to your
production server.

The demos have been created with [Angular CLI](https://cli.angular.io/)</a>
by `ng new [example-name]` and then implemented using the Bryntum Scheduler wrappers. You can refer to an example while
studying this guide to get more information on the implementation.

## TypeScript and Typings

Bryntum bundles ship with typings for the classes for usage in TypeScript applications. You can find `scheduler*.d.ts`
files in the `build` folder inside the distribution zip package. The definitions also contain a special config type
which can be passed to the class constructor.

The config specific types are also accepted by multiple other properties and functions, for example
the [Store.data](#Core/data/Store#config-data) config of the `Store` which accepts type `Partial<ModelConfig>[]`.

Sample code for tree store creation with `ModelConfig` and `StoreConfig` classes:

```typescript
import { Store, StoreConfig, ModelConfig } from '@bryntum/scheduler';

const storeConfig: Partial<StoreConfig> = {
    tree : true,
    data : [
        {
            id       : 1,
            children : [
                {
                    id : 2
                }
            ] as Partial<ModelConfig>[]
        }
    ] as Partial<ModelConfig>[]
};

new Store(storeConfig);
```

## Wrappers

The Angular wrappers encapsulate Bryntum Scheduler and other Bryntum widgets in Angular components that expose
configuration options, properties, features and events. The wrapped all Bryntum UI components so they can be used the
usual Angular way.

To use native API package classes with wrappers import them from `@bryntum/scheduler/scheduler.lite.umd.js`.

```typescript
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
```

### Installing the wrappers package

The wrappers are distributed as a separate package `@bryntum/scheduler-angular` that is installed according to the used
package manager. Please refer to this [guide for Bryntum NPM repository access](#Scheduler/guides/npm-repository.md).

### Wrappers Overview

Wrappers are Angular components which provide full access to Bryntum API widget class configs, properties, events and
features. Each Wrapper has it's own HTML tag which can be used in angular templates. This is the list of available
wrappers for Bryntum Scheduler Angular package:

| Wrapper tag name | Wrapper component name | API widget reference |
|------------------|------------------------|----------------------|
| &lt;bryntum-button/&gt; | BryntumButtonComponent | [Button](#Core/widget/Button) |
| &lt;bryntum-button-group/&gt; | BryntumButtonGroupComponent | [ButtonGroup](#Core/widget/ButtonGroup) |
| &lt;bryntum-checkbox/&gt; | BryntumCheckboxComponent | [Checkbox](#Core/widget/Checkbox) |
| &lt;bryntum-chip-view/&gt; | BryntumChipViewComponent | [ChipView](#Core/widget/ChipView) |
| &lt;bryntum-combo/&gt; | BryntumComboComponent | [Combo](#Core/widget/Combo) |
| &lt;bryntum-container/&gt; | BryntumContainerComponent | [Container](#Core/widget/Container) |
| &lt;bryntum-date-field/&gt; | BryntumDateFieldComponent | [DateField](#Core/widget/DateField) |
| &lt;bryntum-date-picker/&gt; | BryntumDatePickerComponent | [DatePicker](#Core/widget/DatePicker) |
| &lt;bryntum-date-time-field/&gt; | BryntumDateTimeFieldComponent | [DateTimeField](#Core/widget/DateTimeField) |
| &lt;bryntum-duration-field/&gt; | BryntumDurationFieldComponent | [DurationField](#Core/widget/DurationField) |
| &lt;bryntum-file-field/&gt; | BryntumFileFieldComponent | [FileField](#Core/widget/FileField) |
| &lt;bryntum-file-picker/&gt; | BryntumFilePickerComponent | [FilePicker](#Core/widget/FilePicker) |
| &lt;bryntum-filter-field/&gt; | BryntumFilterFieldComponent | [FilterField](#Core/widget/FilterField) |
| &lt;bryntum-grid/&gt; | BryntumGridComponent | [Grid](#Grid/view/Grid) |
| &lt;bryntum-grid-base/&gt; | BryntumGridBaseComponent | [GridBase](#Grid/view/GridBase) |
| &lt;bryntum-list/&gt; | BryntumListComponent | [List](#Core/widget/List) |
| &lt;bryntum-menu/&gt; | BryntumMenuComponent | [Menu](#Core/widget/Menu) |
| &lt;bryntum-number-field/&gt; | BryntumNumberFieldComponent | [NumberField](#Core/widget/NumberField) |
| &lt;bryntum-paging-toolbar/&gt; | BryntumPagingToolbarComponent | [PagingToolbar](#Core/widget/PagingToolbar) |
| &lt;bryntum-panel/&gt; | BryntumPanelComponent | [Panel](#Core/widget/Panel) |
| &lt;bryntum-password-field/&gt; | BryntumPasswordFieldComponent | [PasswordField](#Core/widget/PasswordField) |
| &lt;bryntum-resource-combo/&gt; | BryntumResourceComboComponent | [ResourceCombo](#Scheduler/widget/ResourceCombo) |
| &lt;bryntum-resource-filter/&gt; | BryntumResourceFilterComponent | [ResourceFilter](#Scheduler/widget/ResourceFilter) |
| &lt;bryntum-scheduler/&gt; | BryntumSchedulerComponent | [Scheduler](#Scheduler/view/Scheduler) |
| &lt;bryntum-scheduler-base/&gt; | BryntumSchedulerBaseComponent | [SchedulerBase](#Scheduler/view/SchedulerBase) |
| &lt;bryntum-slider/&gt; | BryntumSliderComponent | [Slider](#Core/widget/Slider) |
| &lt;bryntum-slide-toggle/&gt; | BryntumSlideToggleComponent | [SlideToggle](#Core/widget/SlideToggle) |
| &lt;bryntum-splitter/&gt; | BryntumSplitterComponent | [Splitter](#Core/widget/Splitter) |
| &lt;bryntum-tab-panel/&gt; | BryntumTabPanelComponent | [TabPanel](#Core/widget/TabPanel) |
| &lt;bryntum-text-area-field/&gt; | BryntumTextAreaFieldComponent | [TextAreaField](#Core/widget/TextAreaField) |
| &lt;bryntum-text-field/&gt; | BryntumTextFieldComponent | [TextField](#Core/widget/TextField) |
| &lt;bryntum-time-field/&gt; | BryntumTimeFieldComponent | [TimeField](#Core/widget/TimeField) |
| &lt;bryntum-time-picker/&gt; | BryntumTimePickerComponent | [TimePicker](#Core/widget/TimePicker) |
| &lt;bryntum-toolbar/&gt; | BryntumToolbarComponent | [Toolbar](#Core/widget/Toolbar) |
| &lt;bryntum-trial-button/&gt; | BryntumTrialButtonComponent | [TrialButton](#Core/widget/trial/TrialButton) |
| &lt;bryntum-trial-panel/&gt; | BryntumTrialPanelComponent | [TrialPanel](#Core/widget/trial/TrialPanel) |
| &lt;bryntum-undo-redo/&gt; | BryntumUndoRedoComponent | [UndoRedo](#Scheduler/widget/UndoRedo) |
| &lt;bryntum-widget/&gt; | BryntumWidgetComponent | [Widget](#Core/widget/Widget) |

### Import BryntumSchedulerModule

Add the following code to your `app.module.ts`:

```typescript
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular'

@NgModule({
    imports : [
        BryntumSchedulerModule
    ]
})
```

Then you will be able to use the custom tag like `<bryntum-scheduler>` and others listed above the same way as you use
your application components. Our examples are built this way so you can refer to them to see how to use the tag and how
to pass parameters.

### Using the wrapper in your application

Now you can use the the component defined in the wrapper in your application:

```html
<bryntum-scheduler
    #scheduler
    tooltip = "My cool Bryntum Scheduler component",
    (onCatchAll) = "onSchedulerEvents($event)"
    // other configs, properties, events or features
></bryntum-scheduler>
```

You will also need to import CSS file for Bryntum Scheduler. We recommend to do it in `src/styles.scss`:

```typescript
@import "@bryntum/scheduler/scheduler.material.css";

// other application-global styling
```

### Embedding widgets inside wrapper

Wrappers are designed to allow using Bryntum widgets as Angular components, but they themselves cannot contain other
Bryntum wrappers inside their tag. To embed Bryntum widgets inside a wrapper you should instead use the available
configuration options for the wrapper's widget. Please note that not all widgets may contain inner widgets, please refer
to the API docs to check for valid configuration options.

This example shows how to use a `Toolbar` widget inside the wrapper for Bryntum Scheduler:

Sample code for `app.component.ts`:

```ts
export class AppComponent {

    // Toolbar (tbar) config
    tbarConfig = {
        items : [
            {
                type : 'button',
                text : 'My button'
            }
        ]
    }

}
```

Sample code for `app.component.html`:

```html
<bryntum-scheduler
    #scheduler
    tbar="tbarConfig",
></bryntum-scheduler>
```

## Using Angular components as renderers

To use an Angular component as column renderer, header renderer or tooltip renderer define a custom element using the
Angular component which you want to use as the renderer. It can be done in `src/app/app.module.ts`:

```typescript
// The component used for custom tag definition
import { ColorRendererComponent } from './color-renderer/color-renderer.component';

// Function to create the custom element
import { createCustomElement } from '@angular/elements';

// ... other required imports

@NgModule({
    declarations : [
        AppComponent,
        ColorRendererComponent
    ],
    // These component(s) will be converted to Custom Elements
    entryComponents : [
        ColorRendererComponent
    ],
    imports : [
        BrowserModule,
        BryntumSchedulerModule
    ],
    providers : [],
    bootstrap : [AppComponent]
})

export class AppModule {
    constructor(injector: Injector) {
        // convert Angular Component to Custom Element and register it with browser
        customElements.define('color-renderer', createCustomElement(ColorRendererComponent, { injector }));
    }
}
```

The above renderer then can be used, for example, as a column renderer:

```typescript
columns : [
    {
        text       : 'Angular Component',
        field      : 'color',
        htmlEncode : false, // to prevent encoding of renderer output
        renderer(data: any) {
            const { record, value } = data;
            // Use registered Custom Element tag name and pass it attributes
            return `<color-renderer value="${value.toLowerCase()}" name="${record.name}"></color-renderer>`;
        }
    }
]
```

This approach is used in 
[Grid Angular Renderer demo](https://bryntum.com/examples/grid/frameworks/angular/angular-renderer/dist/angular-renderer/).
The renderers are used the same way also for Scheduler, Gantt, Calendar and others.

## Configs, properties and events

All Bryntum Angular Wrappers support the full set of the public configs, properties and events of a component.

## Listening to Bryntum Scheduler events

The Bryntum Scheduler events are passed up to the Angular wrapper which makes it possible to listen to them the standard Angular
way. The following code demonstrates listening to the `cellClick` event:

Sample code for `app.component.ts`:

```typescript
export class AppComponent implements AfterViewInit {

    onSchedulerCellClick(e : {[key:string] : any}) : void {
        console.log('onCellClick', e);
    }
    // etc.
```

and in `app.component.html`:

```html
<bryntum-scheduler
    #scheduler
    (onCellClick) = "onSchedulerCellClick($event)"

```

Please note that we prefix the capitalized event name with the `on` keyword and that we pass `$event` as
the argument to the listener.

Another valid method is to pass a 
[`listeners`](https://bryntum.com/docs/scheduler/api/Core/mixin/Events#config-listeners)
config object to the Angular wrapper. For example:

Sample code for `app.config.ts`:

```typescript
export const schedulerConfig = {
    listeners : {
        cellClick(e) {
            console.log('cellClick', e);
        }
    },
    // etc
```

and `app.component.html`:

```html
<bryntum-scheduler
    #scheduler
    [listeners] = "schedulerConfig.listeners"

```

Please note that we use unprefixed event names in this case.

### Using dataChange event to synchronize data

Bryntum Scheduler keeps all data in its stores which are automatically synchronized with the UI and the user actions.
Nevertheless, it is sometimes necessary for the rest of the application to be informed about data changes. For that
it is easiest to use `dataChange` event.

`app.component.html`:

```html
<bryntum-scheduler
    #scheduler
    (onDataChange) = "syncData($event)"

```

`app.component.ts`:

```typescript
export class AppComponent {

    syncData({ store, action, records } : { store : Store; action : String; records : Model[]}) : void {
        console.log(`${store.id} changed. The action was: ${action}. Changed records: `, records);
        // Your sync data logic comes here
    }

    // ...
}
```

## Features

Features are suffixed with `Feature` and act as both configs and properties for `BryntumSchedulerComponent`. They are
mapped to the corresponding API features of the Bryntum Scheduler `instance`.

This is a list of all `BryntumSchedulerComponent` features:

|Wrapper feature name|API feature reference |
|--------------------|----------------------|
| cellEditFeature | [CellEdit](#Grid/feature/CellEdit) |
| cellMenuFeature | [CellMenu](#Grid/feature/CellMenu) |
| cellTooltipFeature | [CellTooltip](#Grid/feature/CellTooltip) |
| columnAutoWidthFeature | [ColumnAutoWidth](#Grid/feature/ColumnAutoWidth) |
| columnDragToolbarFeature | [ColumnDragToolbar](#Grid/feature/ColumnDragToolbar) |
| columnLinesFeature | [ColumnLines](#Scheduler/feature/ColumnLines) |
| columnPickerFeature | [ColumnPicker](#Grid/feature/ColumnPicker) |
| columnReorderFeature | [ColumnReorder](#Grid/feature/ColumnReorder) |
| columnResizeFeature | [ColumnResize](#Grid/feature/ColumnResize) |
| contextMenuFeature | [ContextMenu](#Grid/feature/ContextMenu) |
| dependenciesFeature | [Dependencies](#Scheduler/feature/Dependencies) |
| dependencyEditFeature | [DependencyEdit](#Scheduler/feature/DependencyEdit) |
| eventContextMenuFeature | [EventContextMenu](#Scheduler/feature/EventContextMenu) |
| eventCopyPasteFeature | [EventCopyPaste](#Scheduler/feature/EventCopyPaste) |
| eventDragFeature | [EventDrag](#Scheduler/feature/EventDrag) |
| eventDragCreateFeature | [EventDragCreate](#Scheduler/feature/EventDragCreate) |
| eventDragSelectFeature | [EventDragSelect](#Scheduler/feature/EventDragSelect) |
| eventEditFeature | [EventEdit](#Scheduler/feature/EventEdit) |
| eventFilterFeature | [EventFilter](#Scheduler/feature/EventFilter) |
| eventMenuFeature | [EventMenu](#Scheduler/feature/EventMenu) |
| eventResizeFeature | [EventResize](#Scheduler/feature/EventResize) |
| eventTooltipFeature | [EventTooltip](#Scheduler/feature/EventTooltip) |
| excelExporterFeature | [ExcelExporter](#Scheduler/feature/experimental/ExcelExporter) |
| filterFeature | [Filter](#Grid/feature/Filter) |
| filterBarFeature | [FilterBar](#Grid/feature/FilterBar) |
| groupFeature | [Group](#Grid/feature/Group) |
| groupSummaryFeature | [GroupSummary](#Scheduler/feature/GroupSummary) |
| headerContextMenuFeature | [HeaderContextMenu](#Scheduler/feature/HeaderContextMenu) |
| headerMenuFeature | [HeaderMenu](#Grid/feature/HeaderMenu) |
| headerZoomFeature | [HeaderZoom](#Scheduler/feature/HeaderZoom) |
| labelsFeature | [Labels](#Scheduler/feature/Labels) |
| multipageFeature | [MultiPageExporter](#Scheduler/feature/export/exporter/MultiPageExporter) |
| multipageverticalFeature | [MultiPageVerticalExporter](#Scheduler/feature/export/exporter/MultiPageVerticalExporter) |
| nonWorkingTimeFeature | [NonWorkingTime](#Scheduler/feature/NonWorkingTime) |
| panFeature | [Pan](#Scheduler/feature/Pan) |
| pdfExportFeature | [PdfExport](#Scheduler/feature/export/PdfExport) |
| quickFindFeature | [QuickFind](#Grid/feature/QuickFind) |
| regionResizeFeature | [RegionResize](#Grid/feature/RegionResize) |
| resourceTimeRangesFeature | [ResourceTimeRanges](#Scheduler/feature/ResourceTimeRanges) |
| rowCopyPasteFeature | [RowCopyPaste](#Grid/feature/RowCopyPaste) |
| rowReorderFeature | [RowReorder](#Grid/feature/RowReorder) |
| scheduleContextFeature | [ScheduleContext](#Scheduler/feature/ScheduleContext) |
| scheduleContextMenuFeature | [ScheduleContextMenu](#Scheduler/feature/ScheduleContextMenu) |
| scheduleMenuFeature | [ScheduleMenu](#Scheduler/feature/ScheduleMenu) |
| scheduleTooltipFeature | [ScheduleTooltip](#Scheduler/feature/ScheduleTooltip) |
| searchFeature | [Search](#Grid/feature/Search) |
| simpleEventEditFeature | [SimpleEventEdit](#Scheduler/feature/SimpleEventEdit) |
| singlepageFeature | [SinglePageExporter](#Scheduler/feature/export/exporter/SinglePageExporter) |
| sortFeature | [Sort](#Grid/feature/Sort) |
| stickyCellsFeature | [StickyCells](#Grid/feature/StickyCells) |
| stickyEventsFeature | [StickyEvents](#Scheduler/feature/StickyEvents) |
| stripeFeature | [Stripe](#Grid/feature/Stripe) |
| summaryFeature | [Summary](#Scheduler/feature/Summary) |
| timeAxisHeaderMenuFeature | [TimeAxisHeaderMenu](#Scheduler/feature/TimeAxisHeaderMenu) |
| timeRangesFeature | [TimeRanges](#Scheduler/feature/TimeRanges) |
| treeFeature | [Tree](#Grid/feature/Tree) |

## Bryntum Scheduler API instance

It is important to know that the Angular `BryntumSchedulerComponent` is **not** the native Bryntum Scheduler instance, it is
a wrapper or an interface between the Angular application and the Bryntum Scheduler itself.

All available configs, properties and features are propagated from the wrapper down to the underlying Bryntum Scheduler
instance, but there might be the situations when you want to access the Bryntum Scheduler directly. That is fully valid
approach and you are free to do it.

### Accessing the Bryntum Scheduler instance

If you need to access Bryntum Scheduler functionality not exposed by the wrapper, you can access the Bryntum Scheduler instance
directly. Within the wrapper it is available under the `instance` property.

This simple example shows how you could use it:

app.component.html

```html
<bryntum-scheduler
    #scheduler
    tooltip = "My cool Bryntum Scheduler component"
></bryntum-scheduler>
```

Sample code for `app.component.ts`:

```typescript
import { BryntumSchedulerComponent } from '@bryntum/scheduler-angular';
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';

export class AppComponent implements AfterViewInit {

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    private scheduler : Scheduler;

    @ViewChild(BryntumSchedulerComponent, { static : false }) schedulerComponent: BryntumSchedulerComponent;

    ngAfterViewInit(): void {
        // store Bryntum Scheduler isntance
        this.scheduler = this.schedulerComponent.instance;
    }
}
```

When accessing `instance` directly, use wrapper's API widget reference docs from the list above to get available configs
and properties.

## Troubleshooting

### Installing, building or running

If you face any issues building or running examples or your application, such issues can be often resolved by the
Project Cleanup procedure which is described in this
[Troubleshooting guide](#Scheduler/guides/npm-repository.md#troubleshooting)

### Bryntum bundle included twice

The error

```text
Bryntum bundle included twice, check cache-busters and file types (.js)
Simultaneous imports from "*.module.js" and "*.umd.js" bundles are not allowed.
```

usually means that somewhere you have imported both the normal and Lite UMD versions of the Bryntum Scheduler package. Check
the code and import `scheduler.lite.umd.js` version of the Bryntum Scheduler.

Wrong import:

```typescript
import { Scheduler } from '@bryntum/scheduler';
```

Correct import:

```typescript
import { Scheduler } from '@bryntum/scheduler/scheduler.lite.umd.js';
```

When using Angular 9+ lazy-loading with dynamic imports you may also get `Bundle included twice` runtime error, but
with a different cause. The solution for this issue is be to change target from `ESNext` to `CommonJS` in
the `compilerOptions` section of `tsconfig.json` file.

### A property added to schedulerConfig has no effect

If you have added a new property, for example `listeners` to the configuration object, make sure that you also have
added it to the component template, for example:

```html
<bryntum-scheduler>
    [listeners] = "schedulerConfig.listeners"
</bryntum-scheduler>
```

Angular does not process `schedulerConfig` file as a whole but we need to use individual properties in the template.

## JavaScript heap out of memory

"JavaScript heap out of memory" error occurs on large projects where the default amount of memory allocated by node 
is not sufficient to complete the command successfully.

You can increase this amount by running the following command:

**For Linux/macOS:**

```shell
export NODE_OPTIONS=--max-old-space-size=8192
```

**For Windows powershell:**

```shell
$env:NODE_OPTIONS="--max-old-space-size=8192"
```

Alternatively you can increase the amount of memory by adding the following
`NODE_OPTIONS='--max-old-space-size=8192'` config to `scripts` section in **package.json** file:

**For example change used build script:**

```json
{
  "scripts": {
    "build": "your-build-script"
  }
}
```

**to:**

```json
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS='--max-old-space-size=8192' your-build-script"
  }
}
```

To apply this environment config you need `cross-env` npm library which can be installed to devDependencies with:

```shell
nmp install cross-env --save-dev
```

## References

* Config options, features, events and methods [Bryntum Scheduler API docs](#api)
* Visit [Angular Framework Homepage](https://angular.io)
* Post your questions to [Bryntum Support Forum](https://bryntum.com/forum/)
* [Contacts us](https://bryntum.com/contact/)


<p class="last-modified">Last modified on 2022-02-07 10:04:18</p>