# 4.3.8 - 2022-02-07

## BUG FIXES

* Fixed #4100 - `DependencyStore` does not sync when updating dependency

# 4.3.7 - 2022-02-02

## API CHANGES

* [DEPRECATED] Scheduler `beforeExport` and `export` events (triggered by `PdfExport` feature) were deprecated in favor
  of the `beforePdfExport` and `pdfExport` events respectively. The old event names will be dropped in v5.0.0

## BUG FIXES

* Fixed #630 - Drag drop is not finalized correctly when fillTicks is enabled
* Fixed #4050 - `Tooltip` aligned on clipped out area of target element
* Fixed #4051 - `CellTooltip` does not update on next show for the same row, when its record is mutated
* Fixed #4082 - Relayed listeners do not trigger onFunctions
* Fixed #4092 - Code editor wrongly positioned in theme example

# 4.3.6 - 2022-01-13

## BUG FIXES

* Fixed #3779 - Dependencies aren't attached to correct task after scrolling
* Fixed #3798 - The Cancel button of the recurrence confirmation dialog doesn't cause rerender
* Fixed #3933 - An error when using multiSelect filter field config for tree column
* Fixed #3974 - Crash after dragging event with no content element
* Fixed #3976 - Grid Column needs a maxWidth config
* Fixed #3990 - Chrome & Content Security Policy causes failure because of debug code section
* Fixed #3994 - Scheduler fails to scroll for drag-create when row-reorder is enabled

# 4.3.5 - 2021-12-24

## API CHANGES

* [DEPRECATED] ResourceInfoColumn `validNames` is deprecated and will be removed in 6.0

## BUG FIXES

* Fixed #3544 - dragCreate takes wrong dates if weekStartDay is not default
* Fixed #3752 - Restoring state after `filterBy` on grid (or scheduler) crashes
* Fixed #3815 - Event listeners stop working properly after scroll using Firefox
* Fixed #3896 - [TypeScript] Wrong typings of model class configs
* Fixed #3899 - `ScheduleTooltip` feature should forward own configuration into it's tooltip the same as `TooltipBase`
* Fixed #3907 - [TypeScript] Cannot pass Scheduler instance to `Store.relayAll`
* Fixed #3918 - Event tooltip stays visible on target change if `hideOnDelegateChange` is enabled
* Fixed #3927 - TimeAxis available space set too narrow on TimeAxisSubGrid resize
* Fixed #3928 - DateHelper `k` format behaves incorrectly

# 4.3.4 - 2021-12-13

## FEATURES / ENHANCEMENTS

* Updated `advanced`, `animations`, `custom-event-editor` and `drag-from-grid` Angular demos to use Angular 13
  (Fixed #3742)
* Added Angular demo which shows using TimeRanges feature with recurring time spans and TypeScript mixins. Demo is
  located at `examples\angular\recurring-timeranges`
* Added React demo which shows using TimeRanges feature with recurring time spans TypeScript mixins. Demo is located
  at `examples\react\typescript\recurring-timeranges`

## BUG FIXES

* Fixed #3495 - Extra scrollbar space when resizing partner panels
* Fixed #3508 - Deleting all future events does not update recurrenceRule
* Fixed #3621 - [TypeScript] Improve typings of mixins
* Fixed #3699 - Export generates empty pages if scrolled to bottom before
* Fixed #3737 - EventStore's LoadDateRange is too large on ViewPreset changes
* Fixed #3759 - Touch drag starts event drag creation
* Fixed #3763 - EventStore's LoadDateRange emits twice on ViewPreset changes
* Fixed #3767 - Incorrect expand/collapse functionality when the resources are initially collapsed
* Fixed #3801 - Scheduler - White space appearing at the bottom of a tree grid
* Fixed #3830 - resourceRecord param undefined when pasting event using [Ctrl V]
* Fixed #3834 - Make the copy paste suffix configurable
* Fixed #3837 - Scheduler with autoHeight places scrollbar below foreground canvas
* Fixed #3850 - [TypeScript] Missing static properties in typings
* Fixed #3852 - Crash if zooming while hovering event resize handle
* Fixed #3853 - Cannot set row height for scheduler webcomponent
* Fixed #3854 - `DependencyColumn` does not produce valid value for the Filter Feature
* Fixed #3856 - Dragged event bar maintains sticky event styling after aborted drag

# 4.3.3 - 2021-11-30

## FEATURES / ENHANCEMENTS

* `EventSelection` now offers an `isEventSelectable` template method which you can implement to prevent some events from
  being selected (Fixed #3647)
* Scroll performance when using `StickyEvents` was improved by not processing events that are fully in view
  (Fixed #3709)

## API CHANGES

* The `EventTooltip` feature now hides the tooltip on scroll by default, whereas it previously realigned it. This change
  was done to boost scrolling performance, since realigning the tooltip has negative impact on that. To restore the old
  behaviour, configure the feature with `scrollAction : 'realign'`

## BUG FIXES

* Fixed #3370 - Recurring range performance issue if many ranges used
* Fixed #3620 - Milestone's left/right label position is off
* Fixed #3635 - Drag Error with `constrainDragToTimeline: false`
* Fixed #3640 - Left/right labels not vertically centered in demo
* Fixed #3645 - Dependency links are not shown up at browser zoom level 75%
* Fixed #3648 - [DOCS] Content navigation is broken
* Fixed #3662 - Partnered scheduler collapse state not synced
* Fixed #3683 - Not possible to set `constrainDragToTimeline` in `beforeEventDragListener`
* Fixed #3700 - [REACT] Equipment list empty in drag-onto-tasks demo
* Fixed #3702 - Events not shown when `eventId` or `resourceId` of assignments use dataSource
* Fixed #3715 - Infinite scroll changes height of Timeline viewport momentarily
* Fixed #3720 - `dataSource` property not working on dependency from and to fields
* Fixed #3735 - `eventMenuBeforeShow` event doesn't expose browser event
* Fixed #3740 - Support async `beforeshow` event on a widget
* Fixed #3743 - [DOCS] `web.config` file for Windows IIS server
* Fixed #3785 - `infiniteScroll` does not re-center when clicking the rightmost point of the horizontal scrollbar
* Fixed #3800 - Investigate performance with recurring `ResourceTimeRanges`

# 4.3.2 - 2021-10-29

## FEATURES / ENHANCEMENTS

* `EventCopyPaste` feature now fires `beforeCopy` and `beforePaste` events to let you prevent the actions (Fixed #3303)
* Added a new React demo that shows how to use state to bind events and resources to Scheduler. Demo is located in
  `examples/frameworks/react/javascript/react-state` folder (Fixed #3366)


## BUG FIXES

* Fixed #3442 - Recurring events doesn't work in vertical mode
* Fixed #3603 - ResourceTimeRange showing content from reused event element
* Fixed #3604 - Events still rendered after returning false from beforeEventAdd listener

# 4.3.1 - 2021-10-21

## FEATURES / ENHANCEMENTS

* Added a new demo using a big data set in a tree scheduler, called `bigdataset-tree`. Optionally also displays
  ResourceTimeRanges and Dependencies
* Bumped builtin Font Awesome Free to version 5.15.4

## BUG FIXES

* Fixed #2481 - `EventCopyPaste` forces single assignment mode
* Fixed #2495 - Should be possible to disable `StickyEvents` dynamically
* Fixed #2696 - Resource Histogram is not aligned when partnered on the fly
* Fixed #3432 - [ANGULAR] `EventTooltip` template is shown only once when displaying customElement
* Fixed #3479 - Crash after removing multiple events using keyboard
* Fixed #3515 - Setting `resourceTimeRange` store data breaks the view
* Fixed #3523 - Dragging events with Ctrl key pressed always adds to selection
* Fixed #3539 - Resource time ranges are not rendered for initially invisible resource rows
* Fixed #3563 - Feature toggle event for baselines feature does not fire
* Fixed #3567 - Minified css bundle contains unicode chars
* Fixed #3568 - Incorrect `visibleDateRange` in horizontal scroll listener when changing view preset
* Fixed #3574 - Fix recurrence editor handling of monthly pattern using "On the n'th of the month" ("first" was ignored,
  "second" was interpreted as "first", etc.)
* Fixed #3579 - Crash when combining `resourceTimeRanges` and `eventRenderer` with custom content
* Fixed #3593 - Weekly recurrence does not handle Sunday properly

# 4.3.0 - 2021-10-12

## FEATURES / ENHANCEMENTS

* [BREAKING] `@babel/preset-env` config target `chrome: 75` is now used for the UMD bundle. This decreases bundle size
  and improves performance for modern browsers (Fixed #3201)
* Legacy Angular demos for versions 1-5 were removed due to incompatibility with the new UMD bundle format
* Dependency drawing was sped up a bit by not always recalculating dependency bounds. This change will give a boost
  to scroll performance for schedules with many dependencies (Fixed #3486)

## API CHANGES

* TimeAxisColumn now subclasses WidgetColumn (before it was a Column), this should not affect your code. This opens up
  for rendering widgets embedded in row cells, see this demonstrated in the `examples/embedded-chart` demo in
  Scheduler Pro
* [DEPRECATED] Buttons `menuIconCls` config was deprecated in favor of the new `menuIcon` config, which better matches
  the naming of other configs

## BUG FIXES

* Fixed #2811 - Zoomed-out dependencies do not display correctly
* Fixed #3449 - `ResourceTimeRanges` disappear when many tasks are overlapping on a resource
* Fixed #3472 - Error after drop while finalizing async beforeEventDropFinalize event after switching browser tab
* Fixed #3473 - Dependencies not repainted after editing event duration
* Fixed #3474 - Fix and update React Advanced javascript demo
* Fixed #3476 - `DragCreate` does not work after scrolling on Firefox
* Fixed #3477 - Resource time range gets the name of the event after re-add
* Fixed #3482 - EventStore's `add` event not being emitted when editing occurrences
* Fixed #3509 - Tooltip position is wrongly recognized after moving event out of schedule
* Fixed #3521 - Time range and resource time range should not share `z-index`

# 4.2.7 - 2021-10-01

## FEATURES / ENHANCEMENTS

* `ComboBox` can now be configured to accept unmatched typed filter strings to create a new record. Use the
  `createOnUnmatched` config to enable this. This may be configured as a function to create the new record in an
  app-specific way. See the `eventeditor` example for usage (Fixed #3249)
* You can now force single assignment mode using the `singleAssignment` config on EventStore (Fixed #3287)

## BUG FIXES

* Fixed #1481 - Recurring events repeats endless after delete one of occurrences
* Fixed #3166 - Dependency editor Lag field does not use `dependency.lagUnit` value
* Fixed #3413 - Correct DST handling in monthly recurrence for nth weekdays of a month
* Fixed #3422 - [LWC] Scheduler pro doesn't render all events
* Fixed #3444 - Time axis header is broken
* Fixed #3449 - ResourceTimeRanges disappear when many tasks are overlapping on a resource
* Fixed #3456 - End after X time setting not applies for event with end on date setting
* Fixed #3458 - Document nested fields
* Fixed #3479 - Crash after removing multiple events using keyboard

# 4.2.6 - 2021-09-15

## FEATURES / ENHANCEMENTS

* The ResourceTimeRanges feature has a new `tabIndex` config that lets you control if the ranges are focusable/reachable
  using tab or not (Fixed #3391)

## BUG FIXES

* Fixed #3177 – React custom-event-editor demo issues
* Fixed #3208 - Header is rendered incorrectly for monthAndYear preset
* Fixed #3370 - Recurring range performance issue if many ranges used
* Fixed #3376 - Drag create breaks group summary
* Fixed #3383 - Setting store.data throws if syncDataOnLoad:true while re-assigning data with custom fields
* Fixed #3387 - Group header incorrect when showing summary in header
* Fixed #3388 - GroupSummary counts wrong for the first tick if event ends in that tick
* Fixed #3408 - Updated typings to support spread operator for method parameters

# 4.2.5 - 2021-09-08

## FEATURES / ENHANCEMENTS

* ProjectModel now fires a `dataReady` event when the engine has finished its calculations and the result has been
  written back to the records (Fixed #2019)
* The API documentation now better communicates when a field or property accepts multiple input types but uses a single
  type for output. For example date fields on models, which usually accepts a `String` or `Date` but always outputs a
  `Date` (Fixed #2933)

## BUG FIXES

* Fixed #223 - View preset should support any number of headers
* Fixed #1482 - Show a tooltip when drag an event from the grid to scheduler
* Fixed #2756 - Row height is not recalculated when collapsing group when using `collapseToHeader`
* Fixed #3273 - Follow cursor on event resize when using fillTicks
* Fixed #3283 - Resources grouping works incorrect with some data set
* Fixed #3313 - Allow `String`, `String[]` and `Object` in `cls` getter for subclassing `EventModel`
* Fixed #3322 - Add `dataChange` event to framework guides
* Fixed #3323 - Forward step button in toolbar not working
* Fixed #3330 - Syncing records with syncDataOnLoad throws an error
* Fixed #3342 - Bug when combining simpleEventEdit and eventEdit
* Fixed #3345 - AspNet demos use wrong `@bryntum` npm package version
* Fixed #3355 - Column cell tooltip misplaced with `hideDelay = 0`
* Fixed #3356 - `EventResize#showTooltip` config has no effect
* Fixed #3357 - `OnBeforeEventDrag` not working
* Fixed #3374 - Crash after filtering
* Fixed #3377 - Drag create first creates long bar, then hides it

# 4.2.4 - 2021-08-27

## FEATURES / ENHANCEMENTS

* The `EventDragCreate` feature has a new config called `lockLayout`. Set it to `true` to emulate the pre 4.2 drag
  create behaviour, locking events in place until user finishes the drag gesture. Also applies some styling to
  differentiate the event being created from the existing events when the config is used (Fixed #3228)
* ScheduleTooltip feature has a new config `hideForNonWorkingTime` which hides it when hovering weekends and other
  non-working time ranges
* Scheduler's project (that holds all of its stores) now triggers a `change` event when data in any of the stores
  changes. Useful to listen for to keep an external data model up to date for example. This event is also relayed by
  Scheduler as `dataChange`, to allow easier binding in frameworks (Fixed #3281)

## API CHANGES

* [DEPRECATED] The `store` property on the TimeRanges feature was deprecated. The corresponding config was deprecated in
  4.0, the property should have been flagged at the same time

## BUG FIXES

* Fixed #794 - Dependency creation tooltip is initially misaligned
* Fixed #1158 - Filtering out all resources in vertical mode should show empty message
* Fixed #1432 - Scheduler doesn't take DST into account for event duration
* Fixed #1702 - Error if no value in the field used in dataSource paths
* Fixed #2501 - Scheduler in vertical mode should stretch foreground canvas as in horizontal mode
* Fixed #2521 - Not possible to set resourceTimeRangeStore on Scheduler
* Fixed #2887 - Changing event's data while resizing causes issues
* Fixed #2971 - ResourceTimeRangeStore updates not tracked by STM
* Fixed #3116 - Gantt throws on task terminal drag
* Fixed #3150 - Allow EventDragCreateFeature to opt out of finalizing by resizing to zero width
* Fixed #3180 - Drag create does not flip edges correctly
* Fixed #3219 - Replacing events is slow
* Fixed #3231 - Render event for resource time ranges does not fire anymore
* Fixed #3251 - Document recurrent time ranges for timeranges feature
* Fixed #3253 - Crash when dragging row in drag-from-grid demo in vertical mode
* Fixed #3254 - Vertical resourceColumns fillWidth & fitWidth configs have no effect
* Fixed #3262 - Vertical time axis column content overflows its cell
* Fixed #3263 - Deleted dependency still rendered
* Fixed #3265 - Docs are not scrolled to the referenced member
* Fixed #3282 - Dragging the thumb in infinite scroll causes overscrolling
* Fixed #3283 - Resources grouping works incorrect with some data set
* Fixed #3290 - Schedule tooltip should offer to hide itself when hovering non working time
* Fixed #3291 - Scheduler dependency tooltip should render the dependencyIdField rather than `task.id`
* Fixed #3292 - Events disappear in Scheduler on vertical scroll
* Fixed #3297 - Scheduler resource time range name (label) not visible
* Fixed #3298 - Existed in store events not assigned to new added resources if loaded on demand
* Fixed #3300 - Cannot use external URL for resourceImagePath
* Fixed #3305 - Guides look bad in the docs search results
* Fixed #3306 - Doc browser does not scroll to member
* Fixed #3327 - Not possible to combine eventEdit + simpleEventEdit features
* Fixed #3332 - [LWC] Exception when realigning popup

# 4.2.3 - 2021-08-05

## FEATURES / ENHANCEMENTS

* You can now define the default new event duration when double clicking schedule by setting
  config `createEventOnDblClick : { useEventModelDefaults : true }`. When setting config `useEventModelDefaults` to
  true, the default duration and durationUnit will be read from the default values of the `duration` and `durationUnit`
  fields of the EventModel. (Fixed #3234)
* CrudManager can now log warnings to the browser console when it detects an unexpected response format. To enable these
  checks please use the `validateResponse` config (Fixed #2668)
* Fixed a scroll performance regression introduced in version 4.2.2
* [NPM] Bryntum Npm server now supports remote private repository access for Artifactory with username and password
  authentication (Fixed #2864)
* [TYPINGS] Type definitions now contain typed `features` configs and properties (Fixed #2740)

## API CHANGES

* [DEPRECATED] PdfExport feature `export` event is deprecated and will be removed in 4.3.0. Use `export` event on the
  Scheduler instead
* [DEPRECATED] Scheduler `beforeExport` event signature is deprecated and will be removed in 4.3.0. New signature wraps
  config object to the corresponding key

## BUG FIXES

* Fixed #2948 - CrudManager should handle autoSync during sync
* Fixed #3116 - Gantt throws on task terminal drag
* Fixed #3126 - `timeAxisSubGrid` is missing from Scheduler typings
* Fixed #3199 - Setting partner to vertical scheduler in runtime throws
* Fixed #3203 - Crud Manager not sending assignment record
* Fixed #3205 - Scheduler: Summaries not "counted" when event ends outside of current date range
* Fixed #3210 - Drag to create render issue
* Fixed #3232 - EventModel.set() and normalization bug - event moves instead of resizing

# 4.2.2 - 2021-07-21

## FEATURES / ENHANCEMENTS

* You can now distinguish new events being created using drag create (or double clicking in the schedule) by checking
  the Model#isCreating flag. In the DOM, a new CSS class b-sch-creating has been added to all events that are being
  created
* Added a new `hideRangesOnZooming` config to `NonWorkingTime` feature (Fixed #2788). The config allows to disable the
  feature default behavior when it hides ranges shorter than the base timeaxis unit on zooming out
* TimeRange feature can now show a tooltip when hovering a time range header element, by using the new `tooltipTemplate`
  config (Fixed #3194)
* [NPM] Bryntum Npm server now supports `npm token` command for managing access tokens for CI/CD (Fixed #2703)

## BUG FIXES

* Fixed #201 - Line event styles should go from top to bottom in vertical mode
* Fixed #2071 - Support configuring eventeditor / taskeditor child items with 'true' value
* Fixed #2661 - DateTime field in EventEditor does not allow selecting a date same as max value
* Fixed #2666 - Sticky events content positioning issue while scrolling
* Fixed #3141 - Event store optimization
* Fixed #3146 - Scheduler renders too many events for single resource
* Fixed #3147 - Drag create finalization code should not throw when scheduler instance is destroyed
* Fixed #3148 - [ANGULAR] Icon misrendered in dependency demo
* Fixed #3149 - Event drag tooltip misrendered after dragging task out of schedule then back in
* Fixed #3154 - Engine in Scheduler takes too much time to handle the data
* Fixed #3167 - LWC bundle is missing from trial packages
* Fixed #3178 - Syntax highlighter messes up code snippets in docs
* Fixed #3181 - Partnered scheduler does not update after assigning a task in Gantt assignment column
* Fixed #3200 - showTooltip config of EventDragCreate has no effect

# 4.2.1 - 2021-07-07

## FEATURES / ENHANCEMENTS

* Added throttle/buffer options for event listeners (Fixed #2590)
* [FRAMEWORKS] Added `scheduleContextFeature` to frameworks wrappers (Fixed #3135)

## BUG FIXES

* Fixed #3046 - Events being dragged with the StickyEvents feature enabled should keep event inner text in view
* Fixed #3117 - Improve the docs to show how to access `eventRecord` in `beforeShow` listener
* Fixed #3125 - Error when summary feature enabled event starts at time axis end
* Fixed #3131 - Browser unresponsive with large data set
* Fixed #3134 - ScheduleContext should be off by default
* Fixed #3136 - [NPM] Running `npm install` twice creates modified `package-lock.json` file
* Fixed #3139 - Support `on` and `un` methods for `eventTooltip` feature instance

# 4.2.0 - 2021-06-30

## FEATURES / ENHANCEMENTS

* Scheduler has a new config option `infiniteScroll` meaning that as the user scrolls the timeline back or forward in
  time, the "window" of time encapsulated by the TimeAxis is moved and the EventStore fires a `loadDateRange` event
  (Fixed #1114)
* Dependencies can now be created by dropping on the target event without hitting the terminal circle element. The
  defaultValue of the DependencyModel `type` field will be used in this case. (Fixed #3003)
* Dependency creation can now be finalized asynchronously, for example after showing the user a confirmation dialog
* The `EventResize` feature now uses the task's data to change the appearance by updating `endDate` or `startDate` live
  but in batched mode so that the changes are not available for server sync until the operation is finished
  (Fixed #2541)
* EventResize now allows resizing an event to be zero duration, enable this behavior with the new `allowResizeToZero`
  config. (Fixed #2945)
* Added "Upgrade Font Awesome icons to Pro version" guide
* Updated "Replacing Font Awesome with Material Icons" guide

## API CHANGES

* [DEPRECATED] The `resources` param of the `beforeEventAdd` event fired by Scheduler was renamed to `resourceRecords`
  and will be removed in 5.0
* [DEPRECATED] The `newEventRecord` param of the `dragCreateEnd` event fired by Scheduler was renamed to `eventRecord`
  and will be removed in 5.0

## LOCALE UPDATES

* `removeRows` label of CellMenu & GridBase was removed
* Value of `removeRow` label of CellMenu & GridBase was updated to say just 'Remove'
* RowCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed
* EventCopyPaste locales were updated to just say 'Copy', 'Cut' & 'Paste'. `copyRows`, `cutRows` & `pasteRows` keys were
  removed

## BUG FIXES

* Fixed #2366 - Drag to Create - Selection Spans entire resource row instead of an event block
* Fixed #2706 - Drag and drop is not accurate when scrolling vertically
* Fixed #3044 - Dragged event misplaced on scroll
* Fixed #3047 - Time axis header formatting broken
* Fixed #3064 - Vertical demo summary is empty after zooming
* Fixed #3099 - Setting eventStore.data with enabled syncDataOnLoad doesn't update rendered events

* For more details, see [What's new](https://bryntum.com/docs/scheduler/guide/Scheduler/whats-new/4.2.0)
  and [Upgrade guide](https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/4.2.0) in docs

# 4.1.6 - 2021-06-23

## BUG FIXES

* Fixed #110 - Group and Sort features should support custom sorting functions
* Fixed #2756 - Row height is not recalculated when collapsing group
* Fixed #2977 - Summary feature and Filter feature work slow together
* Fixed #3005 - [VUE-3] Problem with Critical Paths due to Vue Proxy and double native events firing bug
* Fixed #3021 - Event editor should not allow end date before start date
* Fixed #3026 - [VUE-2] and [VUE-3] typescript type declarations are missing
* Fixed #3078 - Avatars initials not rendering inside perfect circle

# 4.1.5 - 2021-06-09

## FEATURES / ENHANCEMENTS

* The behaviour when dragging unselected events has changed slightly. Scheduler now selects the event from which a drag
  originates, whereas previously it did not
* [TYPINGS] API singleton classes are correctly exported to typings (Fixed #2752)
* Added a new ResourceCollapse column to toggle `eventLayout` of a resource between overlap and stack. A new
  `resource-collapsing` demo has been added to showcase the feature (Fixed #2979)
* Scheduler now has a `minHeight` of `10em` by default. This assures that the Scheduler will get a size even if no other
  sizing rules are applied for the element it is rendered to. When the default `minHeight` is driving the height, a
  warning is shown on the console to let the dev know that sizing rules are missing. The warning is not shown if a
  `minHeight` is explicitly configured (Fixed #2915)

## BUG FIXES

* Fixed #1358 - EventTooltip configs are missing
* Fixed #2949 - Schedule context menu should not be shown when clicking empty area below rows
* Fixed #2953 - UndoRedo buttons always disabled if used in event context menu
* Fixed #2958 - Weekly Repeat event editor doesn't fit day names
* Fixed #2961 - Recurring event rule is not working correctly for Week/Day view
* Fixed #2974 - eventRecord property not available in onBeforeShow listener
* Fixed #2990 - [ANGULAR] Preventable async events don't work
* Fixed #2991 - Events disappear after scrolling
* Fixed #3000 - Scheduler pro scrolling with touchpad not working properly on Firefox

# 4.1.4 - 2021-05-28

## FEATURES / ENHANCEMENTS

* TypeScript definitions updated to use typed `Partial<>` parameters where available
* Buttons now has a new style `b-transparent` that renders them without background or borders (Fixed #2853)
* [NPM] repository package `@bryntum/scheduler` now includes source code (Fixed #2723)
* [NPM] repository package `@bryntum/scheduler` now includes minified versions of bundles (Fixed #2842)
* [FRAMEWORKS] Frameworks demos packages dependencies updated to support Node v12

## API CHANGES

* [DEPRECATED] The `eventRecord` and `assignmentRecord` params of the `eventKeyDown` & `eventKeyUp` events fired by
  Scheduler were renamed to `eventRecords` and `assignmentRecords` to match the type (array)

## BUG FIXES

* Fixed #31 - Bugs with selection state and scroll position after crudManager.load()
* Fixed #2104 - "Core" code not isomorphic
* Fixed #2519 - Vertical mode resourceStore.filter does not hide all resources even if filter result is empty
* Fixed #2520 - Events are misaligned when changing to summer time
* Fixed #2575 - Memory leak when replacing project instance
* Fixed #2783 - CellMenu not triggered on iPhone's with 3D touch enabled
* Fixed #2834 - Core should not use b-fa for icon prefix
* Fixed #2875 - Selected events cleared after aborted drag drop
* Fixed #2880 - Undoing a deleted event inserts two events
* Fixed #2882 - Snapping not enabled when dragging multiple events
* Fixed #2898 - eventKeyDown / eventKeyUp missing event param
* Fixed #2901 - Focus is lost when scrolling using native scrollbar
* Fixed #2903 - Event Edit modal closes on iPhone when user taps "Done" on the keyboard
* Fixed #2919 - Crash when moving mouse after mouse down and all events are removed before starting drag
* Fixed #2928 - Drag drop not finalized properly if dragged events are removed while dragging
* Fixed #2935 - Error when scrolled vertically and reducing data set size

# 4.1.3 - 2021-05-13

## FEATURES / ENHANCEMENTS

* Bumped the built-in version of FontAwesome Free to 5.15.3 and added missing imports to allow stacked icons etc
* Bumped the `@babel/preset-env` config target to `chrome: 75` for the Module bundle. This decreased bundle sizes and
  improved performance for modern browsers
* Vertical scroll performance was improved by limiting how far out of view events are drawn. Should especially help for
  scenarios where stacking leads to large row heights
* Updated Angular Wrappers to be compatible with Angular 6-7 in production mode for target `es2015`
* EventResize now has a configurable `tooltipTemplate` so you can easily show custom contents in the resizing tooltip
  See updated 'tooltips' demo to try it out (Fixed #2244)
* Added new `encoder.requestData` config for Crud Manager allowing to put static info into request data object
  (Fixed #541)

## API CHANGES

* [DEPRECATED] EventDrag#dragTipTemplate was renamed to `tooltipTemplate` to better match the naming scheme of other
  features
* [DEPRECATED] The `startText`, `endText`, `startClockHtml`, `endClockHtml`, `dragData` params of the EventDrag
  dragTipTemplate / tooltipTemplate methods have been deprecated and will be removed in 5.0

## BUG FIXES

* Fixed #509 - Drag from Grid demo should take in account allowOverlap
* Fixed #1974 - Not possible to add event listeners to EventTooltip feature
* Fixed #2566 - Committing CSS class not cleared correctly
* Fixed #2646 - Resource time zones are not exported correctly
* Fixed #2690 - [ANGULAR] Scheduler can't use custom fields in production build
* Fixed #2704 - setTimeSpan works incorrect if workingTime hours defined
* Fixed #2705 - Loading tree data first time with children true for the first node makes other nodes to ignore their
  children
* Fixed #2754 - Vue error appeared on create new event in custom editor if dependencies created before
* Fixed #2770 - Column lines misaligned when switching locale
* Fixed #2771 - Non-working days demo crash
* Fixed #2774 - Drag drop not finalized if eventStore data is cleared when dragging multiple events
* Fixed #2778 - Wrong module declaration in typings file
* Fixed #2797 - Crash when deleting a selected event using highlightSuccessors
* Fixed #2800 - Delete event menu action does not remove all selected events
* Fixed #2829 - Recurrence editor does not filter its UI according to recurrence type until the recurrence type field
  is *changed*
* Fixed #2857 - Not possible to pass timeAxis column in columns array
* Fixed #2866 - Missing method return value type for `EventSelection.isEventSelected` and
  `EventSelection.isAssignmentSelected`
* Fixed #2867 - Issue after dragging and aborting multiple events with Escape key

## API CHANGES

* [DEPRECATED] `TimeRanges#store` + `TimeRanges#timeRanges` configs have been deprecated in favor of supplying data on
  Scheduler or its project

# 4.1.2 - 2021-04-27

## BUG FIXES

* Fixed #895 - Date in ScheduleTooltip does not update when scrolling

# 4.1.1 - 2021-04-23

## FEATURES / ENHANCEMENTS

* Scheduler / Gantt / Calendar will now react when CTRL-Z key to undo / redo recent changes made. Behavior can be
  controlled with the new `enableUndoRedoKeys` config (Fixed #2532)
* Added a new "Non-working days" demo
* Summary feature is now supported in vertical mode (Fixed #2555)
* Summary feature now supports summing only selected rows (Fixed #2631)
* Vertical mode now supports zooming using mouse wheel or when double clicking a time axis header cell (Fixed #823)
* Added a new Angular 11 Routing demo

## API CHANGES

* Scheduler has a new public property `visibleResources` that returns the range of currently visible resources
* [DEPRECATED] Arguments of `beforeEventDrag`, `eventDragStart`, `eventDrag`, `eventDragAbort` listeners of the
  EventDrag feature have been updated. `context` argument has been deprecated. See the upgrade guide for more
  information
* [DEPRECATED] The events fired by Scheduler.column.TimeAxisColumn (`timeaxisheaderclick`, `timeaxisheadercontextmenu`,
  `timeaxisheaderdblclick`) were deprecated and should instead be listened to on the owning Scheduler / Gantt component

## BUG FIXES

* Fixed #318 - Wrong Event and TimeRange durations when dragging over DST period
* Fixed #868 - Should be possible to show all available context menus programmatically
* Fixed #1083 - Summary not updated after filtering with filter bar
* Fixed #1152 - TimeRange with empty label produces empty label element
* Fixed #1554 - Export demo problems
* Fixed #1987 - DOCS: React guide needs a section on how to listen for events
* Fixed #2151 - Wrong context is passed to the beforeEventDrag listener
* Fixed #2365 - scrollToDate call increases date range period
* Fixed #2380 - eventKeyDown and eventKeyUp events are not documented
* Fixed #2428 - Events disappear on reload if resource store is a tree
* Fixed #2542 - selectionMode with checkbox column does not handle selection mutating inside selectionChange listener
* Fixed #2626 - Last time axis column headers text alignment issue when cropped
* Fixed #2630 - Sticky headers not enabled
* Fixed #2635 - Milestone Resize Error
* Fixed #2636 - [WRAPPERS] Features are not updated at runtime
* Fixed #2644 - timeRangeStore property doesn't work for recurring time ranges
* Fixed #2663 - [ANGULAR] Scheduler crashes on 2nd create after destroy
* Fixed #2664 - Crash when using showCurrentTimeLine with headers hidden
* Fixed #2673 - Unsynced current timeline in partnered schedulers
* Fixed #2675 - Delete key should delete all selected events
* Fixed #2679 - on-owner events should be added to owner too in docs
* Fixed #2681 - Yarn. Package trial alias can not be installed

# 4.1.0 - 2021-04-02

## FEATURES / ENHANCEMENTS

* We are happy to announce that Bryntum Scheduler now can be directly installed using our npm registry. We've updated
  all our frameworks demos to use `@bryntum` npm packages. See them in `examples/frameworks` folder. Please refer to "
  Npm packages" guide in docs for registry login and usage information
* Added a new "Non-working days" demo
* Bryntum demos were updated with XSS protection code. `StringHelper.encodeHtml` and `StringHelper.xss` functions were
  used for this
* Model fields can now be marked with `alwaysWrite` to ensure important data fields are always included when updates are
  committed by a CrudManager (Fixed #848)
* CrudManager now exposes a `changes` property returning an object with the current changes in its stores
* Added new Vue Cell Renderer demo to show Vue Components as cell renderers (Partially fixed #946 - Vue: Support
  components in renderers)
* Schedulers performance was improved compared to version 4.0, mainly by shortening critical code paths such as getting
  record field values and by reducing the amount of work performed during the engines initial commit
* Summary feature now offers a `refresh` method to update summaries. See updated summary demo for sample usage
* Custom rendered HTML for events is no longer wrapped in an element unless there are other elements (such as icon) to
  also render
* Added new Vue 3 Simple demo to show integration of Bryntum Scheduler with Vue 3 (Fixed #1315)
* `eventColor` can now be specified as any valid CSS style (hex, hsl, rgba etc) (Fixed #2314)
* The Labels feature can now be configured to make event labels take part in the event layout process, preventing them
  from being overlapped by other events (Fixed #2147)
* Added new React 17 demo for Scheduler in vertical mode. The example also implements theme switching (Fixed #1823 and
  Fixed #2213)
* ResourceInfoColumn now shows resource initials if no avatar image exists (Fixed #2202)

## API CHANGES

* [BREAKING] Removed RequireJS demos and integration guides in favor of modern ES6 Modules technology (Fixed #1963)
* [BREAKING] `init` method is no longer required in Lightning Web Components and was removed from the LWC bundle
* [DEPRECATED] CrudManager `commit` was deprecated in favor of `acceptChanges`
* [DEPRECATED] CrudManager `commitCrudStores` was deprecated in favor of `acceptChanges`
* [DEPRECATED] CrudManager `reject` was deprecated in favor of `revertChanges`
* [DEPRECATED] CrudManager `rejectCrudStores` was deprecated in favor of `revertChanges`
* [DEPRECATED] In the `DependencyCreation` feature, the `data` param of all events was deprecated. All events now have
  useful documented top level params
* Value of `store` config defined on `TimeRanges` feature is no longer passed to Crud Manager instance. Instead please
  use `timeRangeStore` config on the project. That will both register the store on Crud Manager and used by the feature
  automatically

## BUG FIXES

* Fixed #394 - ScrollManager does not start vertical scrolling if mouse leaves scheduler element
* Fixed #695 - Dependency line not redrawn during resize
* Fixed #893 - Scrolling scheduler while dragging event makes dragged event go away from cursor
* Fixed #1489 - Copy / Cut / Paste event API + context menu entries
* Fixed #1525 - Improve Localization guide
* Fixed #1689 - Investigate sharing static resource between multiple LWC on the same page
* Fixed #1742 - Misleading visual feedback when clicking between multi assigned events
* Fixed #1752 - Error if startDate field is hidden in EventEditor
* Fixed #1873 - Virtual event rendering derenders too eagerly
* Fixed #1893 - [REACT] JSX renderer not supported for TreeColumn
* Fixed #2021 - Adding event when all resources missing fails
* Fixed #2067 - Vertical Scheduler does not update view when undoing actions
* Fixed #2056 - Setting resourceId to newly created event record before it is saved by the event editor fails
* Fixed #2084 - Loading empty assignments does not refresh UI
* Fixed #2163 - Icon is not shown for resource time ranges when iconCls is specified
* Fixed #2166 - Buttons in bottom toolbar of a Popup should be right aligned
* Fixed #2204 - EventEdit docs should show how configure the buttons
* Fixed #2211 - Add test coverage for XSS
* Fixed #2309 - Scheduler weekends are not configurable
* Fixed #2323 - Dependency drag creation fails
* Fixed #2329 - Processing records by the Engine makes CrudManager to load data slowly
* Fixed #2331 - Cursor isn't changed to ew-resize when resizing event
* Fixed #2333 - Dependencies not cleared after setting an empty array
* Fixed #2337 - Disabling recurrenceCombo in Editor fails with exception
* Fixed #2338 - Time axis misrendered if changing scheduler element size
* Fixed #2346 - Drag drop not finalized properly if event is deleted during drag drop
* Fixed #2358 - Scheduler 4.x is 2 times slower than Scheduler 3.x
* Fixed #2359 - Update readme files in all framework demos in all products
* Fixed #2364 - Adding a new event triggers 'update'
* Fixed #2379 - Add minified version of *.lite.umd.js to the bundle
* Fixed #2381 - Unable to Drag from left corner of event when Event#resizable set to 'end'
* Fixed #2386 - Events disappear after setting resources twice
* Fixed #2400 - Sync failure messages displayed in `syncMask` where not auto-closing
* Fixed #2402 - assignmentStore add function ignores `silent` param
* Fixed #2407 - Grid/Scheduler not working in IE11
* Fixed #2414 - Header cell rendering leaves some space on the right when expand the browser window fast
* Fixed #2418 - Project does not respect suspendEvents
* Fixed #2426 - Double clicking tree expander icon should not start editing
* Fixed #2429 - GroupSummary redraws excessively
* Fixed #2430 - Summary redraws excessively
* Fixed #2433 - Time picker doesn't display AM/PM switch properly
* Fixed #2441 - Demo control sizes and styling issues
* Fixed #2450 - Sorting demo breaks when trying to change sort order
* Fixed #2453 - Multiple rebuilds of indices when adding events
* Fixed #2468 - Add a public way to refresh summaries
* Fixed #2474 - Empty text not shown when using autoHeight
* Fixed #2480 - Race condition and me.nextAnimationFrame is not a function error
* Fixed #2486 - Month/year picker is not aligned to date picker properly
* Fixed #2492 - Removed dependency is rendered
* Fixed #2497 - Event derendered on resize
* Fixed #2505 - Clicking tree node expander icon should not focus row
* Fixed #2509 - Docs missing for DependencyCreation events
* Fixed #2511 - Applying empty store state doesn't clear filters/sorters/groupers
* Fixed #2522 - Percent column never displays a value
* Fixed #2526 - Grid: CheckAll checkbox un-checks after drag and drop
* Fixed #2527 - Inconsistent Behaviour with Select All when Collapsed Groups
* Fixed #2528 - Snapping not working when using a custom time axis
* Fixed #2530 - Event disappears after drag drop if timeaxis is filtered
* Fixed #2554 - Vue demo styling issues
* Fixed #2557 - Double click resource histogram header fails
* Fixed #2561 - Drag from grid demo styling bugs
* Fixed #2564 - [LWC] Dependency lines are not created
* Fixed #2577 - Crash after dragging newly created event
* Fixed #2593 - Changes are saved immediately when beforeEventSave listener is async
* Fixed #2598 - Should be possible to detect in DOM what ViewPreset is used

# 4.0.8 - 2021-01-27

## FEATURES / ENHANCEMENTS

* You can now position milestone text inside the diamond or outside (default) with the new `milestoneTextPosition`
  config
* You can now opt out of sticky event behavior for individual Events, using the EventModel#stickyContents field
* Crud Manager now supports less strict `sync` response format allowing to respond only server side changes
  See `supportShortSyncResponse` config for details

## API CHANGES

* [BREAKING] Crud Manager default behaviour has been changed to allow `sync` response to include only server-side
  changes. Previously it was mandatory to mention each updated/removed record in the response to confirm the changes
  With this release the Crud Manager automatically confirms changes of all updated/removed records mentioned in
  corresponding request. To revert to previous strict behaviour please use `supportShortSyncResponse` config

## BUG FIXES

* Fixed #1970 - Infinite requests if wrong response received
* Fixed #2241 - PDF export fails with certain column combination

# 4.0.7 - 2021-01-12

## FEATURES / ENHANCEMENTS

* Scheduler now supports per resource row height, by setting `resource.rowHeight`. The value is used as the actual row
  height for pack and overlap event layouts, and as input for the row height calculation with stack layout. It is also
  possible to control the setting from a column renderer. If no value is supplied, the height configured on the
  Scheduler is used (Fixed #2158)
* Also added per resource event layout support, by setting the new corresponding `resource.eventLayout` field. It
  accepts the same options as `scheduler.eventLayout` (stack, pack, none), and if the field is unspecified it will use
  the layout configured on the Scheduler (Fixed #176)

## BUG FIXES

* Fixed #410 - Resized element goes invisible if dragged to be zero width
* Fixed #1220 - Scheduler time axis is empty after switching between schedulers
* Fixed #1764 - Reordering inserts at the wrong position when the store is filtered
* Fixed #1929 - Drag drop not finalized if eventStore data is updated during dragging
* Fixed #2140 - WebSocket demo shows incorrect action info in Toast messages
* Fixed #2157 - Recreating Scheduler Angular component when resources are bound fails in production mode with build
  optimizer enabled
* Fixed #2182 - Virtual scroller jumps to 0 on first zoom
* Fixed #2184 - zoomToLevel doesn't return current zoom level
* Fixed #2185 - Responsive tickSize is not applied to the timeline
* Fixed #2197 - Broken styles in React demos
* Fixed #2200 - scrollEventIntoView throws error when event belongs to resource in a collapsed parent

# 4.0.6 - 2020-12-29

## BUG FIXES

* Fixed #1741 - Modifying assigned resources of Recurring events does not update UI
* Fixed #1821 - Events multi drag&drop via schedulers works incorrect
* Fixed #2108 - Update of recurring event creates another repeat of event
* Fixed #2120 - Filterable function not able to access "property"
* Fixed #2121 - Zooming in configuration demo breaks time axis

# 4.0.5 - 2020-12-15

## FEATURES / ENHANCEMENTS

* You can now change partnership of Scheduler panels at runtime using `addPartner` / `removePartner` APIs (Fixed #2042)
* EventTooltip now updates itself if its event record updates while tooltip is visible (Fixed #2077)

## BUG FIXES

* Fixed #1314 - Fix for ASPNET demo build in Windows cmd environment
* Fixed #1369 - Simpleeditor is not aligned with record after create
* Fixed #2082 - Not possible to configure a config object or Tooltip instance as EventResize#tip

# 4.0.4 - 2020-12-09

## FEATURES / ENHANCEMENTS

* A new Scheduler feature `StickyEvents` enables the textual content of event bars to "stick" within the scrolling
  viewport until the event itself is out of view. (Fixed #390)
* Added `groupRecord`, `groupField`, `groupValue` to `GroupSummary.renderer` config and `SummaryFormatter.generateHtml`
  method (Fixed #1897)
* A new config `discardPortals` on the React wrapper, that controls the behaviour of cell renderers using React
  components. Set to `false` (default) to enhance performance. Set to `true` to limit memory consumption
* With the TimeRanges feature, you can now easily configure current time indicator to show any text using the updated
  `showCurrentTimeLine` object config
* New fields `resourceMargin` and `barMargin` was added to `ResourceModel`, allowing for per row adjustment of the
  resource margin and the bar margin respectively (Fixed #2014)

## API CHANGES

* EventEdit feature now exposes an 'isEditing' boolean to detect if the editor is currently visible (Fixed #1935)
* You can now specify the date to scroll into view initially, using the new `visibleDate` config
* Task and event renderings that return HTML are now placed in a `<span>`. Previously, such text was placed inside a
  `<div>` but the block-level element caused undesirable wrapping. This applies to simple cases such as names with an
  ampersand (`'&'`) character. Simple text is still rendered as a text node. (Fixed #1989)
* [DEPRECATED] The `getSourceEvent()` and `getTargetEvent()` functions in `DependencyModel` was deprecated in favor of
  the `fromEvent` and `toEvent` getters

## BUG FIXES

* Fixed #70 - Summary and GroupSummary column lines misaligned when autoAdjustTimeAxis is set to false
* Fixed #1303 - Store sorting improvements
* Fixed #1374 - Dark theme tab bar has wrong background
* Fixed #1398 - Error when update current timeline if scheduler is hidden
* Fixed #1763 - Excel exporter demo doesn't really customize exported columns
* Fixed #1812 - Make tables look better in docs
* Fixed #1880 - Crash when dragging right demo splitter
* Fixed #1889 - Settings not applied for scheduler configured with ViewPreset config object
* Fixed #1892 - beforeRemove event doesn't cancel Event removal
* Fixed #1906 - Scheduler resourceTimeRangeStore config doesn't work
* Fixed #1907 - ResourceTimeRanges feature doesn't support recurring ranges
* Fixed #1911 - Runtime error with disabled startTimeField or endTimeField for EventEdit
* Fixed #1930 - Scheduler vertical cell borders missing in vertical mode
* Fixed #1944 - relayAll targets not cleaned up on destroy
* Fixed #1986 - Pan feature should be able to coexist with other mouse input features
* Fixed #2030 - Event edit breaks rendering if beforeEventAdd listener returns false
* Fixed #2036 - Strange drag behavior when using eventDragSelect with multi assignments

# 4.0.3 - 2020-11-17

## FEATURES / ENHANCEMENTS

* A new Scheduler widget type `undoredo` has been added which, when added to the `tbar` of a scheduling widget
  (such as a `Scheduler`, `Gantt`, or `Calendar`), provides undo and redo functionality
* A new config, `collapseToHeader` on the `GroupSummary` feature makes the headers row of a collapsed group contain the
  summary data for the group. Be aware that the group title is limited in width in a collapsed group header with this
  set so that it does not overflow into summary cells. (Fixed #1355)
* Added example to columns localization on guide. (Fixed #1846)
* New `suspendAutoSync()` and `resumeAutoSync()` methods added `ProjectModel` to prevent CrudManager sync operations
  temporarily. (Fixed #1853)

## BUG FIXES

* Fixed #1286 - Event Drag/Drop not working for very small unresizable events
* Fixed #1856 - Scheduler is not defined in menu customization guide
* Fixed #1870 - Vertical mode example UX issues
* Fixed #1879 - Incorrect request URL when CrudManager URL contains query string

# 4.0.2 - 2020-11-04

## BUG FIXES

* Fixed #1307 - Localization for topDateFormat doesn't apply in dayAndWeek and weekAndDay mode
* Fixed #1529 - Task Editor fields should not marked invalid at initial show

# 4.0.1 - 2020-11-03

## BUG FIXES

* Fixed #1706 - Toolbar should not be exported
* Fixed #1712 - Skip non-exportable columns in export dialog window
* Fixed #1740 - Event name is not shown in Scheduler when using dataSource for the name field
* Fixed #1744 - eventEdit `items` config should not be of type Array
* Fixed #1747 - Crash when long pressing splitter on touch devices
* Fixed #1759 - eventColor in eventRenderer is buggy with HEX colors

# 4.0.0 - 2020-10-19

## FEATURES / ENHANCEMENTS

* [BREAKING] Dropped Support for Edge 18 and older. Our Edge <=18 fixes are still in place and active, but we will not
  be adding more fixes. Existing fixes will be removed in a later version
* [BREAKING] Parts of the Scheduler data layer now use async operations, matching how Scheduler Pro and Gantt works
  This affects manipulations of dates and durations, where the UI will not be updated immediately after data
  manipulations but instead moments later. See the upgrade guide for more information
* Scheduler now optionally can be configured with a `project`. A project is an entity that holds all the stores used by
  the Scheduler, a concept moved down from Gantt & Scheduler Pro. If no project is supplied, one is created internally
  Please see the upgrade guide for more details
* [BREAKING] Multi-assignment was made a first class feature of Scheduler. The Scheduler now always uses an
  AssignmentStore internally. If none is assigned one will be created automatically. This change enables
  multi-assignment to work with more features, since it is now the only mode of operation internally. It still supports
  single assignment using the `resourceId` field on events, by automatically creating assignment records in an internal
  AssignmentStore on load/add/change. We recommend transitioning to always use assignments, as
  `resourceId` might get deprecated in the future
* [BREAKING] The `Core/adapter` directory has been removed. There are no longer any Widget adapters. All Widget classes
  register themselves with the `Widget` class, and the `Widget` class is the source of Widget `type` mapping and Widget
  registration and lookup by `id`
* [BREAKING] The way recurring events are inserted into a Scheduler's timeline has changed. Instead of occurrences being
  dynamically generated upon every data change and change of a scheduler's time axis, no extra events are added into the
  store. Occurrences of recurring events are ephemeral and are returned from the new `EventStore.getEvents` API when
  necessary. This should not affect the default operations of apps, but the differences may be apparent in more
  sophisticated apps. To change an occurrence use `occurrence.beginBatch`, then make changes to including setting its
  `recurrence` to null if it's to be a one-off exception, then use `occurrence.endBatch`. That will update the data and
  the UI. See the upgrade guide in the documentation
* [BREAKING] The `Default`, `Light` and `Dark` themes were renamed to `Classic`, `Classic-Light` and `Classic-Dark`
  This change highlights the fact that they are variations of the same theme, and that it is not the default theme
  (Stockholm is our default theme since version 2.0)
* Context menu features refactoring, please see the upgrade guide for details (Fixed #128):
    - naming was simplified by removing the word "Context" in feature names and in event names
    - introduced named objects for menu items, allowing easier customization
    - split context menu features by area of responsibility
    - introduced TimeAxisHeaderMenu feature and made it responsible for header menu of TimeAxis column
* Added support for toggling `constrainDragToResource` dynamically (Fixed #542)
* The HeaderContextMenu feature was refactored and renamed to TimeAxisHeaderMenu (Fixed #8783)
* Column lines are now drawn using divs instead of images + divs. Only divs for lines in view are available in DOM. This
  allows for easier styling and testing of column lines, while only having a very minor impact on performance
* TimeRanges can now show an icon using the `iconCls` field in the data model
* A new event style "rounded" was added, try the updated `eventstyles` demo to see it in action
* Added new config `verticalTimeAxisColumn` that allows configuring the `VerticalTimeAxisColumn` instance used in
  vertical mode with any Column options that apply to it. Changed "vertical" example to use the new
  `verticalTimeAxisColumn` configuration with a field to search values (Fixed #1136)
* Added a new demo + guide showing how to create a custom event editor (Fixed #957)
* Events have acquired an extra internal element, `.b-sch-event-content`. It is used to allow `text-overflow: ellipsis`,
  padding without affecting minimum width and to allow us to much easier place labels for milestones. It also gives you
  more styling options for your custom look, having an additional element to leverage. Note though that it might affect
  any custom event styling you are using
* Scheduler CrudManager PHP demo now supports multiple resource assignment
* The 3d-bars demo was removed. It has a history of being broken in many releases and was deemed not worth keeping
* Scheduler now extends `Panel` instead of `Container`. This allows you to easily add toolbars to it (Fixed #1417)
* Added XSS protection to default renderers (based on `StringHelper.encodeHtml` and `StringHelper.xss`)
* Added support to export events to ICS format with the new `TimeSpan#exportToICS` method. Demonstrated in the new
  `exporttoics` example
* Added `scheduler.lite.umd.js` module that does not include `Promise` polyfill. This module is primarily intended to be
  used with Angular to prevent `zone.js` polyfills overwrite
* Added experimental support for Salesforce Locking Service (Fixed #359). The distributed bundle only supports modern
  browsers (no IE11 or non-chromium based Edge), since Salesforce drops support for these in January 1st 2021 too
* Added Lightning Web Component demo, see `examples/salesforce/src/lwc`
* Dependencies feature has a new public method to get a dependency record from the corresponding DOM element. See
  `resolveDependencyRecord` docs for details

## API CHANGES

* [BREAKING] The `dependencies` feature no longer holds its own store, instead it is configured on Scheduler or in a
  project along with the other stores used by Scheduler. The same applies if configuring it with inline data, the
  `dependencies` config was moved to Scheduler to match how inline data is supplied for other stores
* [BREAKING] Events triggered by the EventDrag feature now always supplies assignment records and event records. If you
  currently use multi-assignment, you might need to adjust your listeners
* [BREAKING] `RecurringEvents` feature was removed. Use the `enableRecurringEvents` boolean config on the Scheduler
* [BREAKING] `RecurringTimeSpans` feature was removed as no longer needed for displaying recurring events
* [BREAKING] Event selection now more clearly distinguishes between selected assignments and selected events. Previously
  for example `scheduler.selectedEvents` would return events or assignments depending on mode. Now it always returns
  events, and assignments are returned by `scheduler.selectedAssignments`. The same thinking applies to the events
  triggered by selection, there is now a new `assignmentSelectionChange` event in addition to the existing
  `eventSelectionChange`
* [BREAKING] The `removeUnassignedEvent` config was moved from Scheduler to EventStore. If you have it explicitly
  configured with `false` or are using a standalone EventStore you might have to add/move it in your code. If you rely
  on an event record being available after being unassigned, you should configure with `removeUnassignedEvent: false`
* [BREAKING] An EventStore is no longer directly linked to a ResourceStore or an AssignmentStore. Nor does it handle the
  date normalization on its own. If you are using standalone stores (not connected to a Scheduler), you have to use a
  project to hold the stores. See the upgrade guide for more information
* [BREAKING] Event records can no longer be shared between multiple stores. The stores can still be shared
* [BREAKING] Field `serialize` function `this` has been changed to refer the field definition (it used to refer the
  model instance before)
* [BREAKING] A clarification to changes in alpha-1, regarding async date manipulation: Dates and durations are also
  calculated async when data is loaded or new events are added. To simplify the transition to this approach new
  awaitable `addAsync()` and `loadDataAsync()` functions were added to project stores. See upgrade guide for more
  information (Fixed #1505)
* [DEPRECATED] `context.draggedRecords` argument of `Scheduler.feature.EventDrag.validatorFn` function is deprecated
  Use `context.eventRecords` instead
* [DEPRECATED] The `tplData` param in the `eventRenderer` function was deprecated in favor of the new `renderData` param
* [DEPRECATED] abstract `TimeSpanRecordContextMenuBase` class was deprecated, in favor of `TimeSpanMenuBase`
* [DEPRECATED] `HeaderContextMenu` feature was deprecated. `TimeAxisHeaderMenu` was introduced instead
* [DEPRECATED] `EventContextMenu` feature was renamed to `EventMenu`
* [DEPRECATED] `ScheduleContextMenu` feature was renamed to `ScheduleMenu`
* [DEPRECATED] `occurrencesready` event has been removed
* Event elements no longer use cryptic ids (like `id="scheduler-57-r2-x"`). If you need a CSS selector for a specific
  event, you can instead use `[data-event-id="myid"]`. Following this simplification, the `getResourceRecordFromDomId()`
  and `getEventRecordFromDomId()` functions has been removed
* The `WidgetColumn.onBeforeWidgetSetValue` and `WidgetColumn.onAfterWidgetSetValue` functions was made public to allow
  greater control
* Model fields in derived classes are now merged with corresponding model fields (by name) in super classes. This allows
  serialization and other attributes to be inherited when a derived class only wants to change the `defaultValue` or
  other attribute of the field
* The `dateFormat` config for `type='date'` model fields has been simplified to `format`
* Model date fields are serialized by default according to the field `format` (Fixed #273)
* Schedulers "main" stores (EventStore, ResourceStore, AssignmentStore and DependencyStore) has had their event
  triggering modified to make sure data is in a calculated state when relevant events are triggered. This affects the
  timing of the `add`, `remove`, `removeAll`, `change` and `refresh` events. Please see the upgrade guide for more
  information (Fixed #1486)
* The following previously deprecated members/classes were removed:
    - `ResourceImageColumn.imagePath` and `ResourceImageColumn.defaultImageName`
    - `EditBase.extraWidgets`
    - `ViewPreset`, compatibility layer introduced in 3.0 was removed
    - `TimelineDateMapper.getDateFromX()`
    - `TimelineEventRendering.tickWidth`
    - `beforeZoomChange` and `zoomChange` events for `TimelineViewPresets`

## BUG FIXES

* Fixed #520 - Preventing sync request throws uncatchable exception
* Fixed #592 - Row disappear when scrolling a lot
* Fixed #911 - React custom event editor demo improvements
* Fixed #996 - Type of EditBase#items config docs are wrong
* Fixed #1009 - Time axis misaligned in vertical mode if scheduler is scrolled
* Fixed #1087 - Events disappear after a vertical scroll
* Fixed #1199 - Vertical bold tick line is missing when show only working time and Sunday is filtered out
* Fixed #1266 - Gantt+Scheduler demo: First scheduler resource row animates into view
* Fixed #1227 - Crash after undoing event deletion
* Fixed #1337 - Export columns look strange in demo
* Fixed #1342 - Scheduler throws when dragging event out of the view on filtered time axis
* Fixed #1345 - Assignment store changes are not in sync request
* Fixed #1365 - Editing two events, second edit affects first
* Fixed #1371 - Possible to change event start date with readonly mode enabled
* Fixed #1373 - EventEditor demo event styling broken
* Fixed #1376 - Drag create breaks leaving visible proxy
* Fixed #1378 - Recurring time ranges missing from recurring time ranges demo
* Fixed #1384 - Dependency not redrawn on new assignment
* Fixed #1391 - Scheduler throws when trying to navigate a filtered event store
* Fixed #1392 - Scheduler throws when trying to remove recurrent event
* Fixed #1396 - eventStore.getEvents could go into infinite loop if recurrence feature is enabled
* Fixed #1399 - Improve EventEdit docs* Fixed #1375 - Vertical mode does not fill viewport correctly
* Fixed #1418 - Fields missing from AssignmentModel docs
* Fixed #1419 - An error when using custom renderer for schedulerTooltip
* Fixed #1431 - Recurring events don't render on load
* Fixed #1447 - Scheduler big data set example doesn't sort on column click
* Fixed #1462 - BigDataset demo fails when few resources
* Fixed #1464 - Bug on Unassign action in Drag from grid demo
* Fixed #1466 - Newly created event has bad top label in Labels demo
* Fixed #1473 - Scheduler validation example no longer validates properly
* Fixed #1483 - Fixed time format with AM/PM removing the "0" changing from 09:00 PM to 9:00 PM. Changed viewPreset
  `hourAndDay` on `middleDateFormat` to `K` for en-US locale
* Fixed #1487 - Dependency lines are not removed when regenerating dataset
* Fixed #1497 - Event added using Plus button on the TopBar loses some data
* Fixed #1499 - Cannot edit standalone event having startDate + duration
* Fixed #1542 - Scheduler put inside of panel gets narrow with overlay scrollbar
* Fixed #1546 - Cannot drag drop narrow events
* Fixed #1548 - [ANGULAR] Investigate zone.js loading order and set it to Angular default
* Fixed #1552 - ExtJS Scheduler demo: Uncaught TypeError: Cannot read property 'getTime' of null
* Fixed #1564 - scrollToNow() results in wrong timeline headers
* Fixed #1570 - Events disappear when scrolling
* Fixed #1576 - Setting resourceId via set method does not update assignment
* Fixed #1582 - Next valid drag after invalid drag is broken in Safari
* Fixed #1590 - Summary feature redundant refreshing
* Fixed #1607 - constrainDragToTimeSlot does not maintain event start date while dragging
* Fixed #1642 - Scheduler.scrollToNow() during paint broken when part of TabPanel

# 3.1.9 - 2020-08-26

## BUG FIXES

* Fixed #779 - Working time: Crash when dragging event starting & ending outside timeaxis
* Fixed #1351 - EventStore + syncDataOnLoad = crash
* Fixed #1353 - Exporting scheduler with groups to excel crashes

# 3.1.8 - 2020-08-11

## BUG FIXES

* Fixed #1244 - Initial export options are shown incorrectly in the export dialog
* Fixed #1263 - eventStyle 'colored' not populated for hex color codes

# 3.1.7 - 2020-07-24

## FEATURES / ENHANCEMENTS

* Added new exporter: MultiPageVertical. It fits content horizontally and then generates vertical pages to fit vertical
  content. (Fixed #1092)

## BUG FIXES

* Fixed #402 - Export UI should validate date range fields
* Fixed #460 - Make RecurrenceConfirmationPopup buttons handlers public
* Fixed #563 - Tick size cannot be set less than certain value
* Fixed #910 - Crash when exporting to PDF if schedule area has no width
* Fixed #953 - Load mask appearing on top of export progress
* Fixed #969 - Multi page export of more than 100 tasks fails
* Fixed #972 - Export feature does not export dependencies unless visible first
* Fixed #973 - Export feature does not respect left grid section width
* Fixed #1093 - DatePicker should respect weekStartDay timeline config
* Fixed #1172 - Wrapper should not relay store events to the instance
* Fixed #1175 - Resize cursor stuck after clicking event resize handle
* Fixed #1180 - Exported grid should end with the last row
* Fixed #1198 - Resizing left handle outside schedule area to the left stretches event width
* Fixed #1201 - Event not refreshed if dropping it back in same position in Websocket demo
* Fixed #1249 - Columns lines are not exported correctly
* Fixed #1252 - Adding predecessor removes dependency line to the successor
* Fixed #1256 - Initial animation aborted
* Fixed #1260 - Scheduler freezes after drag drop with many events

# 3.1.6 - 2020-07-10

## FEATURES / ENHANCEMENTS

* Added Docker image of the PDF Export Server. See server README for details. (Fixed #905)

## API CHANGES

* [DEPRECATED] To avoid risk of confusing the Scheduler instance with the calculation engine,  `schedulerEngine` has
  been deprecated in favor of `schedulerInstance` in all framework wrappers (Angular, React, Vue). (Fixed #776)

## BUG FIXES

* Fixed #897 - Splitter does not work on iPads
* Fixed #974 - Cannot hide Delete button in EventEditor
* Fixed #1005 - Vertical mode not working in Vue
* Fixed #1067 - VerticalTimeAxisColumn header should be not focusable
* Fixed #1095 - Time header get blank when changing view preset after export

# 3.1.5 - 2020-06-09

## FEATURES / ENHANCEMENTS

* Updated Font Awesome Free to v5.13.0
* Updated ScheduleTooltip docs to show how to customize the tip content (Fixed #809)
* ScheduleTooltip is now shown also when Scheduler is readOnly, set the feature to disabled to hide it completely
* [DEPRECATED] ScheduleTooltip#getHoverTipHtml is now deprecated in favor of the new `generateTipContent` method
  allowing you to completely customize the markup shown inside it
* Removed React and Vue CDN demos in favor of existing framework examples (Fixed #840)
* Moved localization from `'GridBase.serverResponseLabel` to `'CrudManagerView.serverResponseLabel`
* Renamed localization from `RecurrenceCombo.Custom...` to `RecurrenceCombo.Custom`

## BUG FIXES

* Fixed #780 - removeRow text missing
* Fixed #791 - Dependency creation tooltip is always invalid in angular when module bundle is used instead of umd
* Fixed #846 - No scheduleclick event triggered in IE in area next to splitter
* Fixed #865 - afterEventDrop is not fired when event is dropped outside the timeline
* Fixed #881 - Tooltip is blinking in Firefox when hoverDelay is specified
* Fixed #886 - commit triggered twice after event dragged from partner
* Fixed #896 - Event element is left when reassign is used on the event model and autoCommit is enabled

# 3.1.4 - 2020-05-19

## BUG FIXES

* Fixed #772 - undefined query parameter in CrudManager URLs

# 3.1.3 - 2020-05-14

## FEATURES / ENHANCEMENTS

* Scrolling in a dataset with varying row heights has been improved. Scheduler now pre-calculates heights up to a
  configurable row count limit and populates a row height map used to estimate the total scroll height better

## BUG FIXES

* Fixed #322 - Fields with complex mapping are not updated properly on sync
* Fixed #539 - Scrollbar changes position during scroll when row heights vary greatly in a small dataset
* Fixed #553 - Loadmask not hidden after load fails
* Fixed #554 - Safari shows wrong dates in event editor
* Fixed #565 - Scheduler Export to PDF failed with grouping enabled
* Fixed #570 - Scrolling with touch doesn't work on events
* Fixed #583 - CrudManager should load URL provided in requestConfig
* Fixed #603 - Resource images in ResourceInfoColumn flicker after record update
* Fixed #638 - constrainToTimeSlot setting not cleared when drag starts

# 3.1.2 - 2020-04-17

## FEATURES / ENHANCEMENTS

* The scheduler.module.js bundle is now lightly transpiled to ECMAScript 2015 using Babel to work with more browsers out
  of the box
* The PDF Export feature scrolls through the dataset in a more efficient manner. Fixed #578

## BUG FIXES

* Fixed #443 - Failed CrudManager load/sync should show failure message just like Store loading does
* Fixed #464 - Dependencies are not refreshed after filtering with schedule region collapsed
* Fixed #471 - CrudManager + AjaxHelper sends wrong content type
* Fixed #515 - Dependencies cannot be created in scheduler web component
* Fixed #572 - CrudMananger load GET request has Content-Type header set to json

# 3.1.1 - 2020-03-27

## BUG FIXES

* Fixed #120 - Vertical mode misses 'renderTimeSpan' method
* Fixed #314 - Load mask is not hidden after receiving unsuccessful response
* Fixed #369 - Resource time range title changes on scrolling in vertical mode
* Fixed #404 - Crash in CrudManager demo after saving updated event
* Fixed #409 - Crash when clicking next time arrow in event editor if end date is cleared
* Fixed #441 - Recurrence dialog is too narrow
* Fixed #445 - React: Scheduler crashes when features object passed as prop
* Fixed #454 - "No records to display" shown during loading
* Fixed #457 - Docker container with gantt ASP.NET Core demo cannot connect to MySQL container
* Fixed #459 - Event editor should be scrollable if it does not fit in viewport
* Fixed #466 - `constrainDragToResource` should be supported in vertical mode

# 3.1.0 - 2020-03-10

## FEATURES / ENHANCEMENTS

* New Recurring Events React+TypeScript demo (Fixed #655)
* New Recurring Events Angular 9 demo (Fixed #654)
* Added new demos showing integration with .NET backend and .NET Core backend (Fixed #299)
* Font Awesome 5 Pro was replaced with Font Awesome 5 Free as the default icon font (MIT / SIL OFL license)

## BUG FIXES

* Fixed #083 - Drag selection element position wrong if page is scrolled
* Fixed #320 - Resource margin does not affect milestone size
* Fixed #346 - Cascading combo box not editable
* Fixed #347 - Crash if starting timerange drag while previous drag operation is finalizing
* Fixed #348 - Tooltip misaligned after clicking add in tasks demo
* Fixed #380 - Vue custom event editor shows editor only once
* Fixed #384 - Dependencies not repainted after group collapse / expand
* Fixed #385 - Ghost event element remains in view after adding new event/resource and syncing changes to backend
* Fixed #403 - Aborted fetch should not create exception in console

# 3.0.4 - 2020-02-24

## FEATURES / ENHANCEMENTS

* Compressed non-working time was added to TimeAxis demo (Fixed #319)

## BUG FIXES

* Fixed #198 - Promise not resolved when showing a shown Popup
* Fixed #203 - Events stay selected after other events selection if they are not in the viewport
* Fixed #288 - Add recurringTimeSpans to framework wrappers and update guides
* Fixed #292 - Crash when using arrow key in simple event editor
* Fixed #295 - Scroll is reset to top after clicking time axis in vertical mode
* Fixed #333 - Crash when creating dependency in web components demo

# 3.0.3 - 2020-02-13

## FEATURES / ENHANCEMENTS

* Added a new demo using cellGenerator + improved cellGenerator docs  (Fixed #250)
* Added new `resourceheaderclick`, `resourceheaderdblclick`, `resourceheadercontextmenu` events fired when interacting
  with resource header in vertical mode (Fixed #282)

## API CHANGES

* [DEPRECATED] The `beforeZoomChange` and `zoomChange` events are deprecated. These are synonyms for
  `beforePresetChange` and `presetChange`

## BUG FIXES

* Fixed #194 - fillTicks fills the next day if time is 00:00:00
* Fixed #243 - Scheduler doesn't properly render rows for resource tree loaded on demand
* Fixed #245 - timeRanges not refreshed if its store uses beginBatch/endBatch
* Fixed #260 - Cannot enter negative lag in dependency editor
* Fixed #263 - Scrolling breaks after event resize
* Fixed #276 - Event disappears after drag drop (Angular Drag from Grid demo)

# 3.0.2 - 2020-01-30

## FEATURES / ENHANCEMENTS

* PDF export server was refactored. Removed websocket support until it is implemented on a client side. Added logging
  Added configuration file (see `app.config.js`) which can be overridden by CLI options. Multipage export performance
  was increased substantially (see `max-workers` config in server readme)
  (Fixed #112)

## API CHANGES

* Added `image` field for `ResourceModel`

## BUG FIXES

* Fixed #195 - ExtJS modern demo: not possible to create more than one instance dynamically
* Fixed #207 - EventDrag constraint wrong when constrainDragToTimeline is false
* Fixed #210 - Assignment store does not fire `change` event when editing resources
* Fixed #220 - Load mask with CrudManager not working
* Fixed #226 - columnLinesFor config is ignored when switching between view presets
* Fixed #233 - Assignments updated when just changing event dates in event editor
* Fixed #234 - Missing "Recurring events" demo resource image

# 3.0.1 - 2020-01-17

## FEATURES / ENHANCEMENTS

* PDF Export feature uses *Scheduler* as the default file name (Fixed #117)
* Added new Grid methods `enableScrollingCloseToEdges` / `disableScrollingCloseToEdges` to activate automatic scrolling
  of a SubGrid when mouse is close to the edges. Demonstrated in the updated scheduler 'dragfromgrid' demo
* Added support to show async tooltips (Fixed #148). Showcased in updated `tooltips` demo. See EventTooltip feature docs
  for information

## API CHANGES

* [BREAKING] (for those who build from sources): "Common" package was renamed to "Core", so all our basic classes should
  be imported from `lib/Core/`
* Added `resourceImageExtension` config to `SchedulerEventRendering` mixin to support setting resource image extension
* EventNavigation#navigator config changed from public to internal. This config should not be needed in normal use of
  the Scheduler

## BUG FIXES

* Fixed #25 - eventContextMenu triggered when right clicking summary bar
* Fixed #45 - Event not derendered after setting future dates in event editor of new event
* Fixed #59 - EventDragSelect feature selects events even if drag happens on locked grid
* Fixed #62 - Event disappears after drag cancelled with ESC and followed by ZoomIn/Out
* Fixed #96 - Drag create proxy not removed if autoClose is false on EventEdit feature
* Fixed #97 - weekStartDay not updated after localization
* Fixed #104 - Calendar icon should be shown in tooltips if date format doesn't include hour info
* Fixed #105 - Time axis breaks after scrolling leftwards a long way bug high-priority resolved
* Fixed #119 - Infinite image requests in vertical demo
* Fixed #129 - Crash when exporting scheduler with no dependencies
* Fixed #130 - Crash when export Scheduler with columnLines disabled
* Fixed #136 - PresetManager methods not declared as static in gantt.d.ts
* Fixed #137 - Drag drop of multiple selected events in vertical mode does not work
* Fixed #146 - Recurring event not rendering occurrences
* Fixed #163 - Recurrence UI should be disabled by default
* Fixed #168 - Broken Vue CDN demo
* Fixed #169 - Features disabled in Vue demos
* Fixed #189 - DOCS: Public configs should not link to private configs/classes

# 3.0.0 - 2019-12-20

## FEATURES / ENHANCEMENTS

* New Ionic Themes demo which shows using and changing included themes. (Fixed A#9394)
* Added support for exporting the Scheduler to PDF and PNG. It is showcased in several examples, pdf-export for Angular,
  React and Vue frameworks, as well as in examples/export. The feature requires a special export server, which you can
  find in the examples/_shared/server folder. You will find more instructions in the README.md file in each new demo. (
  Fixed A#6268)
* Added public config to disable recurring event fields in event editor UI (Fixed #71)

## API CHANGES

* [BREAKING] The `ViewPreset` now uses a `headers` array instead of named header levels in a `headerConfig` property. So
  the `columnLinesFor` property is now an index into that array. (Fixed A#9325, A#4469)
* ViewPresets and zoom levels were refactored for easier usage. `ViewPresets` are now contained in a `PresetStore` and
  zooming steps between them, removing the need of manually defining `zoomLevels`
* TimeSpan (and its subclasses such as EventModel) now uses `DateHelper.defaultFormat` as the default format for parsing
  strings to dates (applies to `startDate` and `endDate`). The actual format used by default is still the same, but now
  more easily configurable (Fixed #32)
* Scheduler now also uses `DateHelper.defaultFormat` as its default format for the timeaxis start and end dates. This
  change makes it behave slightly different, previously it would expect milliseconds in its format and now it does not
* Scheduler#getDateFromX is deprecated because it is orientation dependent. Scheduler#getDateFromCoordinate should be
  used if you have the position on the correct axis, or Scheduler.getDateFromXY if you have a coordinate pair

## BUG FIXES

* Fixed #6 - hideHeaders in combination with timeRanges causes crash
* Fixed #18 - onEventCommit triggers too many row refreshes
* Fixed #58 - Timeline is broken when event is scrolled into view
* Fixed #65 - Event is not repainted to the updated time if its resource has been changed too
* Fixed #72 - Drop date is resolved based on cursor position instead of proxy element
* Fixed A#8569 - Scheduler doesn't paint events for resource with id 0
* Fixed A#8570 - Dependencies with id: null are reusing one dependency line
* Fixed A#9456 - Event editor recurring UI should be hidden when RecurringEvents feature is disabled

# 2.3.1 - 2019-11-20

## BUG FIXES

* Fixed #3 - Crash when using recurrence custom field

# 2.3.0 - 2019-11-06

## FEATURES / ENHANCEMENTS

* Scheduler now supports recurring events (Fixed A#8305). See new `recurrence` demo and `recurringEvents` feature in the
  docs for details
* Added a thinner version of Scheduler called `SchedulerBase`. It is a Scheduler without default features, allowing
  smaller custom builds using for example WebPack. See the new `custom-build` demo for a possible setup (Fixed A#7883)
* Event removal using keyboard and the event editor is now both preventable through the `beforeEventDelete` event
  triggered on Scheduler (Fixed A#8681)
* The horizontal time axis header now only renders ticks in view, reducing the performance impact of displaying long
  time ranges (Fixed A#9022)
* Added `dragHelperConfig` to EventDrag feature to be able to easily configure the internal DragHelper instance
  (Fixed A#9276)
* `mode` property is supported by Angular/React/Vue wrappers by default now (Fixed A#9320)
* `scheduleClick`, `scheduleDblClick` and `scheduleContextmenu` events now also include information about the current
  tickStartDate and tickEndDate of the timeAxis
* New `scheduleMouseMove` event added with same event signature as `scheduleClick`
* Support for disabling features at runtime has been improved, all features except Tree can now be disabled at any time
* Widgets may now adopt a preexisting DOM node to use as their encapsulating `element`. This reduces DOM footprint when
  widgets are being placed inside existing applications, or when used inside UI frameworks which provide a DOM node. See
  the `adopt` config option. (Fixed A#9414)
* The `dragfromgrid` demo was updated with toggling between vertical and horizontal mode (Fixed A#8985)
* The `drag-between-schedulers` and `partners` demos uses a new Splitter widget to allow adjusting the size of the
  Schedulers (Fixed A#9138)
* Experimental: The React wrapper has been updated to support using React components (JSX) in cell renderers and as cell
  editors. Please check out the updated React demos to see how it works (Fixed A#7334, Fixed A#9043)
* React Integration Guide updated with information on new JSX and React Components renderers and editors support
  (Fixed A#9245)
* Added new Angular 8 demo (Fixed A#9336)

## BUG FIXES

* Fixed A#7998 - DOCS: Links are wrong if open grid docs from scheduler docs
* Fixed A#8272 - Dep lines can be orphaned when multiassigned event shares resource with single assigned
* Fixed A#8522 - STYLING: Line header element and body element should have same color
* Fixed A#8642 - Custom event sorting is not supported
* Fixed A#8660 - DOCS: Column lines major ticks are not thicker
* Fixed A#8702 - TimeRanges feature throws an exception when Scheduler is in a Popup
* Fixed A#8898 - Resizing should work also when events are small
* Fixed A#9036 - Assigning to a resource which is filtered out doesn't move event to the resource
* Fixed A#9234 - Event disappears on drag/drop between multiple schedulers
* Fixed A#9236 - Dependency store changes are not empty after initialization
* Fixed A#9249 - Tooltip End Date wrong if event ends on midnight
* Fixed A#9254 - draggable field not respected for multi-event drag
* Fixed A#9258 - VUE: Custom Event Editor demo does not use the full screen height on iPad
* Fixed A#9270 - Crash after creating event in vertical mode after sync
* Fixed A#9307 - eventDragSelect feature missing from react wrappers
* Fixed A#9316 - Should be possible to specify renderer for ResourceInfoColumn
* Fixed A#9395 - Code shown in ResourceInfoColumn after few changes to events

# 2.2.5 - 2019-09-16

## FEATURES / ENHANCEMENTS

* Added example that shows how to use Vue popup as a custom event editor and (Partial fix A#8721)
* Added example that shows how to use Angular popup as a custom event editor (Fixed A#8721)

## BUG FIXES

* Fixed A#9110 - Crash if undoing change to event which is inside collapsed parent
* Fixed A#9199 - TimelineZoomable passes level: -1 in the zoomChange event
* Fixed A#9202 - ResourceInfo column reloads non-existing image instantly
* Fixed A#9210 - Crash when opening eventEditor programmatically in vertical mode
* Fixed A#9215 - CrudManager only syncs featured stores
* Fixed A#9216 - DOCS: Nested configs look broken
* Fixed A#9218 - TimeRanges feature doesn't update element properly on id change
* Fixed A#9224 - CrudManager doesn't commit records on sync
* Fixed A#9232 - getStartEndDatesFromRectangle not implemented for vertical mode
* Fixed A#9241 - EventTooltip hides on left/right scroll with magic mouse while still over an event

# 2.2.4 - 2019-09-09

## FEATURES / ENHANCEMENTS

* Added a customization guide about switching to Material Icons (Fixed A#8969)
* New example that shows how to use React popup form as a custom event editor (partial fix of A#8721)
* Added `triggerEvent` config for TimeSpanRecordContextMenuBase (inherited in ScheduleContextMenu, EventContextMenu), to
  set event which triggers context menu (Fixed A#8757)
* Scheduler now fires `eventDragAbort` in case of an aborted drag operation (Fixed A#9195)

## BUG FIXES

* Fixed A#7809 - eventType field should update visibility of the other EventEditor fields
* Fixed A#8658 - STYLING: Milestone layout demo renders incorrectly
* Fixed A#9067 - Crud manager should support fetchOptions
* Fixed A#9111 - Unexpected transitions for existing events when adding new events
* Fixed A#9149 - Crash when dragging many tasks and some end up outside time axis, then dragged back
* Fixed A#9150 - TimeAxis#round off for distant months
* Fixed A#9151 - Event bars of multi week events not visible at extreme zoom in levels
* Fixed A#9168 - Default image not shown after scrolling
* Fixed A#9192 - Crash in vertical mode if calling store.endBatch

# 2.2.3 - 2019-08-27

## FEATURES / ENHANCEMENTS

* A new `resourceMargin` config was added to Scheduler, to allow more control over the event layout. Use it to specify
  the margin between the first/last stacked/packed event within a resource and the resources edges (row or column
  depending on mode). Defaults to use the configured `barMargin`, making it backwards compatible (Fixed A#7888)
* A `readOnly` mode was added to the event editor (Fixed A#8343)

## API CHANGES

* The default region for new columns has changed to be the first region (usually "locked") in Scheduler (Fixed A#7423)

## BUG FIXES

* Fixed A#6357 - Dependency creation tooltip prevents creating dependecies in some cases
* Fixed A#7816 - Investigate performance when changing start/end dates
* Fixed A#8093 - No need to redraw other rows on changes with eventLayout: 'none'
* Fixed A#8764 - Partner timelines out of sync after zooming
* Fixed A#8772 - ScheduleTooltip should reposition itself upon hover over it
* Fixed A#8947 - VERTICAL: Scroll to date not functioning
* Fixed A#8998 - ResourceTimeRanges not drawn after clearing and repopulating resource store
* Fixed A#9004 - Resource images reloaded upon every Resource change
* Fixed A#9017 - zoomchange event signature doesn't match doc
* Fixed A#9032 - Adding event when no rows to display fails with exception
* Fixed A#9046 - Angular-N demos are broken
* Fixed A#9073 - vue drag-from-grid demo cannot be built with yarn
* Fixed A#9090 - Resource images reloaded when resource column width changes
* Fixed A#9098 - Warn users if scrollEventIntoView is not possible
* Fixed A#9105 - STYLING: Change major tick column lines to use Grid's cell border color, minor tick lines slightly
  faded
* Fixed A#9112 - Crash when modifying number of resources in bigdataset demo
* Fixed A#9115 - Timerange header position is incorrect after scroll
* Fixed A#9120 - Vertical scheduler throws exception when autoHeight is true
* Fixed A#9127 - ResourceInfoColumn.validNames null disallows all names

# 2.2.2 - 2019-08-15

## FEATURES / ENHANCEMENTS

* Support for dragging multiple events at once was added, check it out in the `dragselection` demo (Fixed A#8289)
* New Ext Scheduler to Bryntum Scheduler migration guide (Fixed A#8595)

## BUG FIXES

* Fixed A#7697 - Milestone position wrong in Custom Event Styling demo
* Fixed A#8456 - Dependencies feature not working in nested events demo
* Fixed A#8722 - No context menu shown when dependencies initialized as disabled or get disabled
* Fixed A#8842 - beforeclose event not fired consistently for EventEditor
* Fixed A#8939 - HeaderContextMenu range setting does not handle sub-day ticks
* Fixed A#8965 - Resource time ranges missing after filtering + zooming
* Fixed A#8972 - Crash in vertical mode if a resource has no name defined
* Fixed A#8994 - Advanced Angular demo (angular 8) fails to run production build
* Fixed A#9009 - Dependency terminals visible after event resize with 'allowCreate' set to false

# 2.2.1 - 2019-07-24

## BUG FIXES

* Fixed A#8730 - Dependencies are not redrawn after change
* Fixed A#8877 - Crash in Tasks demo when typing arrow right on an event
* Fixed A#8893 - PHP demo: doesn't save changes for newly created events
* Fixed A#8894 - PHP demo: fails when try to edit an event after another is created
* Fixed A#8923 - Child nodes not shown for newly added resource in a tree
* Fixed A#8933 - Vue trial demos don't work in IE11
* Fixed A#8942 - Crash when starting vertical mode demo on touch device
* Fixed A#8943 - Crash when dragging newly created event
* Fixed A#8944 - Crash when clicking next arrow in start date field of date range menu
* Fixed A#8946 - VERTICAL: Resizing small event starts both resize + drag

# 2.2.0 - 2019-07-19

## FEATURES / ENHANCEMENTS

* New vertical rendering mode added showing resources on the horizontal axis and time on the vertical axis. The vertical
  mode compatible with most Scheduler features, be sure to check out the new `vertical` demo (Fixed A#7504)
* New integration example Filtering Scheduler for React with TypeScript (Fixed A#7408)
* Scheduler now supports zooming by dragging a range in the time axis header. Use the new HeaderZoom feature to enable
  this behavior (Fixed A#8747)
* Added a `resourceImagePath` to Scheduler, for shared usage by features that displays resource miniatures (such as
  ResourceInformationColumn and the header in vertical mode)
* [BREAKING] The Bryntum Scheduler wrapper for React and Angular has been rewritten to support passing different values
  to features and config options with same names. Property names must be now suffixed with `Feature` to differentiate
  features and config options, for example `timeRangesFeature`. In this example, `timeRangesFeature` would be propagated
  to Scheduler features and `timeRanges` property would go to Scheduler itself

## API CHANGES

* [DEPRECATED] ResourceInfoColumns `imagePath` and `defaultImageName` configs was deprecated in favour of the new
  `resourceImagePath` and `defaultResourceImageName` configs on Scheduler
* [DEPRECATED] Scheduler's `tickWidth` property is deprecated, it is called `tickSize` now

## BUG FIXES

* Fixed A#8694 - Touch drag on events should only start after a small delay
* Fixed A#8736 - nonWorkingTime feature highlights wrong zones when scheduler shows only working time
* Fixed A#8867 - React drag onto tasks demo in full screen
* Fixed A#8873 - VUE Localization demo: Locales are hardcoded
* Fixed A#8878 - Specifying listeners for event editor breaks drag create feature and tooltip
* Fixed A#8918 - ResourceTimeRanges not rendered when filtering tasks

# 2.1.3 - 2019-07-04

## FEATURES / ENHANCEMENTS

* The integration guides for Angular, React and Vue have been updated to reflect the latest versions of our examples and
  wrappers

## BUG FIXES

* Fixed A#8746 - Drag and drop breaks row rendering when the view is scrolled and drop makes events overlapped
* Fixed A#8750 - Scheduler shouldn't fire beforeEventAdd event if eventEdit feature exists
* Fixed A#8804 - Error / warnings in console of web components demo
* Fixed A#8818 - PHP demo: creating a new event fails
* Fixed A#8819 - PHP demo: changing assignment to a different resource duplicates the event
* Fixed A#8843 - Drag between schedulers: Bottom scheduler header bug
* Fixed A#8868 - Crash when zooming in narrow screensize
* Fixed A#8871 - Exception thrown when removing event under mouse pointer

# 2.1.2 - 2019-06-27

## BUG FIXES

* Fixed A#8667 - GroupSummary sometimes not rendering
* Fixed A#8705 - Not possible to disable dependency creation
* Fixed A#8719 - Clean up public configs that were removed in 2.1 release (showAddEventInContextMenu,
  showRemoveEventInContextMenu, showUnassignEventInContextMenu)
* Fixed A#8720 - REGRESSION: readOnly mode should disable default context menu items
* Fixed A#8726 - DependencyEdit editDependency crashes when called programmatically
* Fixed A#8761 - Grid vertical scroll height not updated after event add
* Fixed A#8762 - Time range elements are sized incorrectly when zooming out

# 2.1.1 - 2019-06-14

## BUG FIXES

* Unfortunately we broke event animations in 2.1.0, this release re-enables them

# 2.1.0 - 2019-06-12

## FEATURES / ENHANCEMENTS

* Bumped built in FontAwesome to version 5.8.2
* Demos now have a built in code editor that allows you to edit their code (Chrome only) and CSS (Fixed A#7210)
* Scheduler now supports selecting multiple events using drag drop (Fixed A#8647)
* Scheduler now has a new SimpleEventEdit feature for editing the name of an event (Fixed A#8648)
* Multiple new Angular demos added, see the `examples/angular` folder

## API CHANGES

* The `cls` property of `Scheduler.model.Event` is now an instance of `Common.helper.util.DomClassList`. Code which uses
  it as a string will continue to work as the class has a `toString` inplementation, and the the `set Cls` setter will
  promote incoming strings. But using the `DomClassList` API allows easy adding and removal of individual CSS classes,
  easy testing for presence of a CSS class and more accurate comparisons of two Events' classes. The
  `DomClassList#isEqual` method will work regardless of the _order_ that class names were added
* Scheduler repaints dependencies asynchronously when dependency, assignment or event is changed. Use
  `dependenciesDrawn` event to know when dependency lines are actually painted. `draw`, `drawDependency` and
  `drawForEvent` are still synchronous
* [BREAKING] Context menu Features are configured in a slightly different way in this version. If you have used the
  `extraItems` or `processItems` options to change the contents of the shown menu, this code must be updated. Instead of
  using `extraItems`, use `items`

  The `items` config is an *`Object`* rather than an array. The property values are your new submenu configs, and the
  property name is the menu item name. In this way, you may add new items easily, but also, you may override the
  configuration of the default menu items that we provide

  The default menu items now all have documented names (see the `defaultItems` config of the Feature), so you may apply
  config objects which override default config. To remove a provided default completely, specify the config value as
  `false`

  This means that the various `showXxxxxxxInContextMenu` configs in the Scheduler are now ineffective. Simply use for
  example, `items : { deleteEvent : false }` to remove a provided item by name

  `processItems` now recieves its `items` parameter as an `Object`, so finding predefined named menu items to mutate is
  easier. Adding your own entails adding a new named config object. Use the `weight` config to affect the menu item
  order. Provided items are `weight : 0`. Weight values may be negative to cause your new items to gravitate to the top
* [DEPRECATED] EventEdit's `extraWidgets` config was deprecated and will be removed in a future version. Please use
  `extraItems` instead
* [BREAKING] EventSelection#deselectEvent now always maintains current selected events. (Fixed A#8646)

## BUG FIXES

* Fixed A#8063 - Drag resize ignores allowOverlap set to false
* Fixed A#8205 - Dependencies can be rendered wrong for out of view events/tasks
* Fixed A#8245 - Aborting task drag with ESC does not redraw dependency
* Fixed A#8258 - Scheduler/examples/multiassign-with-dependencies/ throws error when dragging event and mouse moves over
  splitter
* Fixed A#8380 - Non working time should highlight header time axis cells
* Fixed A#8393 - CrudManager tries to sync invalid record
* Fixed A#8544 – React: drag from grid freeze bug
* Fixed A#8546 - scrollEventIntoView/scrollResourceEventIntoView should focus event element
* Fixed A#8584 - ColumnLines feature misrendering
* Fixed A#8600 - Zoom to fit not functioning correctly
* Fixed A#8601 - Nested demo: nested event styles
* Fixed A#8657 - Presets should have column lines defined for the lowest header level by default
* Fixed A#8663 - Rendering broken in drag from grid demo

# 2.0.3 - 2019-05-23

## FEATURES / ENHANCEMENTS

* EventDrag feature can now be programmatically disabled

## API CHANGES

* CrudManager would previously when used with a tree store erroneously append new records from the backend without
  specified `parentId` to the first record in the store, whereas it now will append them to the root

## BUG FIXES

* Fixed A#7561 - Should be able to use Grid & Scheduler & Gantt bundles on the same page
* Fixed A#8350 - Pan feature should also scroll the view by clicking on an event when drag and drop is disabled
* Fixed A#8369 - ResourceInfoColumn should show default image if loading fails
* Fixed A#8392 - 'cls' CSS class not added to rendered dependency
* Fixed A#8398 - Event not selected if clicking the resize handle
* Fixed A#8403 - Workingtime demo: Drag create out the right side of the time axis
* Fixed A#8411 - Scheduler redrawn twice on EventStore dataset
* Fixed A#8431 - Drag between schedulers demo not working with mobile device
* Fixed A#8484 - New events not saved in CrudManager demo
* Fixed A#8487 - Unchanged events in row are animated upon event add

# 2.0.2 - 2019-05-10

## FEATURES / ENHANCEMENTS

* Scheduler now only redraws affected rows if events change, greatly speeding up cases where a change does not affect
  the height of the row (Fixed A#8303)
* Labels for TimeRanges are now rendered in the time axis header to not be covered by task elements in the timeline
  (`showHeaderElements` config of the feature switched to `true` by default)
* New initial animation 'zoom-in' added
* Animations demo extended to showcase initial animations, also includes a custom animation

## API CHANGES

* Dependency hover and creation tooltips can now be enabled separately (`showTooltip` vs `showCreationTooltip`)

## BUG FIXES

* Fixed A#7496 - Allow aborting event resize with ESC
* Fixed A#7968 - zoomToSpan should take centerDate config into account
* Fixed A#8069 - Provide public timeRanges property on CrudManager
* Fixed A#8307 - Context menu should work on whole scheduling area
* Fixed A#8319 - Current timeline header element not initially shown
* Fixed A#8337 - Subclasses of TimeRanges remove each others elements
* Fixed A#8346 - TimeRange with startDate == endDate not rendered properly
* Fixed A#8355 - Selection of next event upon deletion bugged by implementation of non working time
* Fixed A#8365 - Event style not cleaned up properly on reuse

# 2.0.1 - 2019-05-03

## BUG FIXES

* Fixed A#7906 - RoughJS demo not running in IE11
* Fixed A#7932 - Crash if timeRange lacks start or end date
* Fixed A#7947 - Dependencies feature sets up its store listeners too early
* Fixed A#7956 - EventNavigation fires an incorrect event signature for the navigate event
* Fixed A#7974 - Having leaf item at the top of the tree makes the whole tree broken
* Fixed A#7976 - Should not highlight timeaxis column on hover
* Fixed A#7977 - Dependency drag terminals wrong colour after mouseup of event resize drag
* Fixed A#7981 - When moving an event into the far future, dep lines are redrawn wrong and not kept up to date
* Fixed A#7989 - Timeaxis filter field width overflows its container
* Fixed A#7997 - Mouseout of event through dep terminal leaves resizing class present on inner
* Fixed A#8005 - Resource timeranges not rendering correctly with eventLayout 'none'
* Fixed A#8006 - Investigate poor scrolling performance on partnered schedulers with many events
* Fixed A#8041 - Normal header is not correctly stretched inside flex layout
* Fixed A#8046 - "event(s)" in ResourceInfoColumn template should be localized
* Fixed A#8066 - Working time demo: Column lines for middle day viewpreset out of sync
* Fixed A#8084 - Scheduler view not reacting to 'refresh' event after endBatch()
* Fixed A#8128 - getDateFromDomEvent doesn't work with non-local mouse events
* Fixed A#8144 - Header menu items duplicated if using multiple instances of TimeRanges
* Fixed A#8161 - TimeRanges doesn't work in React Typescript demo
* Fixed A#8221 - Drag proxy misplaced if page is scrolled
* Fixed A#8263 - Event selection should be cleared if drag starts without CTRL pressed

# 2.0.0 - 2019-03-28

## FEATURES / ENHANCEMENTS

* New demo using WebSockets added (client + server)
* New demo using Ionic added (Fixed A#7426)
* New demo showing integration to the Vuestic web app (IE11 is not supported) (Fixed A#7831)
* New demo showing cascading combos in Event Editor (Fixed A#7755)
* New demo using Rough.js for custom sketched event styling added (Fixed A#7493)
* Demos ported to vue: drag-from-grid, drag-onto-tasks (TypeScript, Fixed #756)
* Included a new default theme called "stockholm"
* Added animation for first display of events (Fixed A#7550)
* Scheduler now supports filtering the time axis ticks and/or defining a custom tick generator to create a
  non-continuous time axis. Try the new `timeaxis` demo to see it in action (Fixed A#6597)
* Added support for specifying working days and hours, which will be used to either filter the time axis or stretch the
  rendered events depending on zoom level (Fixed A#7536)
* Removed flatpickr as our time picker for `TimeField` and replaced with our own implementation (Fixed A#7396)
* Made it possible to manipulate items of HeaderContextMenu before show (Fixed A#7544)
* Added support for using dependencies with multi assigned events (Fixed A#6749)
* Added API to show context menu for event record (Fixed A#7621)
* Scheduler now supports multiple regions for columns, as opposed to only two previously (locked and normal). Check out
  the new columns demo to see how it works (Fixed A#7642)
* Add support for dashed and dotted lines to the ColumnLines feature (Fixed A#7653)
* Events can now be split in pieces using the new `split` API. Demonstrated in tooltips demo and eventcontextmenu demo
* Angular demos no longer use `autoHeight`, instead they get their height from CSS as most of other demos do. This makes
  code from them a bit easier to reuse outside of our demos (Fixed A#7767)
* EventEdit feature now triggers a `beforeEventEditShow` event on scheduler after constructing the editor and loading
  the event, but before being shown. Allows you to hook in to for example filter the resources combo (Fixed A#7520)
* Added a `style` field to the `TimeSpan` model. Can be used to apply custom styling to events, time ranges and resource
  time ranges (Fixed A#7596)
* New `getVisibleDateRange()` API added (Fixed A#7876)
* The CrudManager `AjaxTransport` mixin now uses our internal AjaxHelper and the fetch API for transport,
  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## API CHANGES

* Previously private field accessors on the event editor feature were made public (nameField, resourceField etc.) to for
  example allow manipulation of shown resources when displaying the editor (Fixed A#7519)
* TimeAxisViewModel was made public, it handles mapping between the data based time axis and the UI. You can access it
  using `scheduler.timeAxisViewModel` to find out the date at a specific pixel etc
* EventContextMenu#onElementContextMenu is private now, use EventContextMenu#showContextMenuFor instead
* 'beforeEventDrag' is no longer fired on mousedown, but on the first mousemove following a mousedown (Fixed A#7723)
* [BREAKING] The `renderEventsAsContainers` has been removed, and the rendering simplified. All Events are rendered
  inside their own wrapper element. _This will only affect you if you have custom styling applying to event elements and
  were not using `renderEventsAsContainers: true`_
* [BREAKING] TimeField's and DateField's `pickerFormat` config was removed in favour of using `format` also for the
  picker
* [BREAKING] EventEditors resource field was renamed from `resourceIdField` -> `resourceField` to reflect the fact that
  it might involve multi assignment (Fixed A#7518)
* [BREAKING] Scheduler now renders it contents on `paint` instead of on `render`, to allow it to initialize correct when
  embedded in tab panels and similar. Because of this change, the `render` event was removed
* [BREAKING] `idField` config was removed from `Store`, it was not used in the codebase and did not work as intended
  The config is still available and working on `Model`, set it on your subclass (`MyModelClass.idField = 'MyId'`). If
  you really want to remap id to another field in your data without subclassing `Model` you can still do it using the
  `fields` config on `Store`: `new Store({ fields : [{ name : 'id', dataSource : 'MyId' }] });`

## BUG FIXES

* Fixed A#7422 - Cannot read property 'atob' of undefined
* Fixed A#7483 - finalize method called twice when cancelling event resizing
* Fixed A#7500 - Crash in CrudManager demo if making changes while sync is in progress
* Fixed A#7599 - Event rendering in month is a bit off
* Fixed A#7669 - TimeField in EventEditor left/right buttons should use same increment as current viewPreset
  timeResolution
* Fixed A#7675 - EditBase should check field validity in a more precise manner
* Fixed A#7719 - Assignment cannot be moved correctly if it overlaps with itself and allowOverlap is false
* Fixed A#7708 - ScheduleTip and EventTip disabled after dragging en event out of view
* Fixed A#7726 - DOCS: Complete list of defaults
* Fixed A#7732 - Event selection lost after loading new dataset which contains previously selected event id
* Fixed A#7733 - Old selected events not cleaned up when a dataset changes
* Fixed A#7735 - TimeSpan.normalize should respect mapping
* Fixed A#7758 - ViewPreset headerConfig "align" has no effect
* Fixed A#7760 - ViewPreset headerConfig "headerCls" has no effect
* Fixed A#7761 - Some feature methods, exposed to scheduler, are not typed properly
* Fixed A#7770 - Events not deleted when parent tree node deleted
* Fixed A#7802 - Incorrect dates on the timeaxis when resolution unit is month
* Fixed A#7810 - Filterable timeaxis doesn't work with DAY shift unit
* Fixed A#7863 - Crash after drag drop when scrolled to bottom and replacing events dataset
* Fixed A#7869 - Setting showCurrentTimeLine to false doesn't work

# 1.2.5 - 2019-02-26

## FEATURES / ENHANCEMENTS

* Updated the React guide to reflect the change of bundle used in the demo (it uses scheduler.module.transpiled.js to
  allow the demo to run in IE11)

## BUG FIXES

* Renamed event relay prefix in the vue wrapper to avoid naming collisions (eventStore -> events etc.)
* Fixed react_typescript build

# 1.2.4 - 2019-02-19

## FEATURES / ENHANCEMENTS

* Updated `readme.md` to better describe the projects folder structure and different included bundles

## BUG FIXES

* Fixed A#7560 - Crash in GroupSummary demo
* Fixed A#7629 - Error when building Angular demos

# 1.2.3 - 2019-02-14

## FEATURES / ENHANCEMENTS

* Added a date picker to EventEditor, Angular, and Vue demos (Fixed A#7584)

## BUG FIXES

* Fixed A#7547 - STYLING: Wrong selection style for group header rows
* Fixed A#7563 - Scroll reset in partners demo
* Fixed A#7590 - STYLING: Headers missing padding in IE11
* Fixed A#7608 - react_build demo is broken
* Fixed A#7609 - passStartEndParameters config has no effect
* Fixed A#7619 - Dblclicking a summary row should not create a new event
* Fixed A#7620 - Incorrect position for events below collapsed group in groupsummary demo

# 1.2.2 - 2019-01-28

## API CHANGES

* ANGULAR: The Scheduler component was previously relaying events from EventStore and ResourceStore by prefixing them
  with `eventStore` and `resourceStore`, making it possible to listen for for example `eventStoreAdd` or
  `resourceStoreRemove`. The prefix was causing naming collisions internally and have now been changed to `events`
  and `resources` -> `eventsAdd` / `resourcesRemove`. In case you rely on this in your code, you need to rename to match
  the new pattern

## BUG FIXES

* Fixed A#7529 - After a drag on empty calendar spot, the scheduleClick event is no more fired
* Fixed A#7541 - Crash when updating rendered timerange to be nonrendered
* Fixed A#7558 - Error during dragdrop in angular demo
* Fixed A#7555 - Drag from grid example throws error

# 1.2.1 - 2019-01-17

## API CHANGES

* The behaviour when setting `startDate` after initialization on Scheduler has changed from modifying the length of the
  displayed time range to instead shift it backwards or forwards, keeping its duration. `endDate` still modifies the
  length of the time range. To allow control over this behaviour `setStartDate` and `setEndDate` methods have been added
  to the Scheduler, both accepting a `keepDuration` flag (Fixed A#7410)

## BUG FIXES

* Fixed A#6576 - AjaxTransport does not honour headers config
* Fixed A#7194 - Crash when exporting schedule with grouped column
* Fixed A#7354 - Angular demo does't work in IE11
* Fixed A#7370 - [EDGE] Investigate Angular + trial bundle
* Fixed A#7400 - Drag between schedulers demo: Cannot read property 'isMilestone' of undefined
* Fixed A#7402 - Bundle aliases for angular demos not updated
* Fixed A#7409 - React Typescript demo doesn't work in IE11
* Fixed A#7413 - Crash when creating new event in multi-assignment mode
* Fixed A#7421 - Unexpected animation after event add
* Fixed A#7440 - Crash in WebComponents demo after drag drop
* Fixed A#7441 - Crash when updating resourceTimeRange of non-existing resource
* Fixed A#7443 - Scroll bars showing/hiding indefinitely
* Fixed A#7444 - Crash when deleting new multiassigned task
* Fixed A#7448 - Crash in drag-between-schedulers demo
* Fixed A#7452 - Trial demos do not work in Edge
* Fixed A#7466 - Can't access dropped record when dragging between schedulers
* Fixed A#7482 - Should not fire 'eventclick' after resizing
* Fixed A#7485 - allowOverlap is not taken into account when dragging from another Scheduler
* Fixed A#7492 - Column lines do not match headers if autoAdjustTimeAxis is false
* Fixed A#7495 - End dates mismatch in resize tooltip
* Fixed A#7502 - Timeaxis rendering not consistent in drag from grid demo
* Fixed A#7503 - Drag drop breaks if event start is aligned with viewport left edge
* Fixed A#7511 - Group summary rows visible in resource combo of event editor
* Fixed A#7516 - Typings generation misses `implements` if no `extends`

# 1.2.0 - 2018-12-19

## FEATURES / ENHANCEMENTS

* React wrapper changed to use `shouldComponentUpdate()` to prevent unnecessary re-renders
* Added React + TypeScript demo (Fixed A#7283)
* Full TypeScript typings included as `build/scheduler.d.ts`. Typings define module `bryntum-scheduler` to avoid
  possible name collisions, so we had to also rename import in the angular demo
* Vue wrapper now adds watchers for all props
* New demo using Vue CLI added (Fixed A#7121)
* New feature + demo ResourceTimeRanges added. Renders time ranges per resource, displayed behind events (Fixed A#7176)
* Built in version of FontAwesome was bumped to 5.5.0
* New demo showing drag drop of tasks between two Scheduler instances (Fixed A#7069)
* Improved the "drag from grid" demo, adding new behavior to automatically reschedule overlapping tasks (Fixed A#7355)
* Added a new guide on how to listen for events (Fixed A#7196)
* Docs updated to state that locales should be included before the umd bundle to have effect (Fixed A#7205)
* Scheduler.feature.HeaderContextMenu now accepts an `extraItems` array to add extra items to the header context menu
* The context menu for events now accepts a `processItems` function that allows processing of the items before the menu
  is shown (Fixed A#6887)
* A context menu for empty parts of the schedule was added, ScheduleContextMenu (Fixed A#6724)
* Built in version of FontAwesome was bumped to 5.5.0

## API CHANGES

* [BREAKING] AssignmentModels `getEvent()`, `getResource()`, `getEventName()` and `getResourceName()` removed in favor
  of properties `event`, `resource`, `eventName` and `resourceName`
* [BREAKING] TimeRanges `rangeCls` and `lineCls` were made private
* `DependencyStore#getEventIncomingDependencies` renamed to `getEventpredecessors`
* `DependencyStore#getEventOutgoingDependencies` renamed to `getEventsuccessors`
* The `resourceRecord` parameter of the Scheduler.feature.EventEdit#beforeeventsave event object was deprecated in favor
  of `resourceRecords` to better support multiple assignments

## BUG FIXES

* Fixed A#7195 - Production build broken in angular demo
* Fixed A#7224 - Store filter is not getting applied again when it's supposed to
* Fixed A#7243 - Dependency lines misplaced
* Fixed A#7246 - Salesforce demo doesn't work
* Fixed A#7259 - React demo doesn't work in IE11
* Fixed A#7267 - Dependency Tooltip width increases while moving (Firefox only)
* Fixed A#7293 - Event is not visible in monthAndYear preset if end date is out of scheduler timespan
* Fixed A#7307 - Dragging event to the right makes it disappear
* Fixed A#7311 - Angular demo does not work in Edge
* Fixed A#7315 - UI not refreshed when finalizing resize flow with `false` to cancel it
* Fixed A#7316 - EventEdit endTimeConfig has no effect
* Fixed A#7324 - Crash when deleting event in multassign demo
* Fixed A#7325 - Angular production buid doesn't work with trial sources
* Fixed A#7344 - Setting a new dataset crashes when using AssignmentStore
* Fixed A#7346 - react_build demo is missing .babelrc config

# 1.1.2 - 2018-11-23

## FEATURES / ENHANCEMENTS

* EventTooltip docs updated to show that you can use Tooltip configs to affect the tooltip

## API CHANGES

* CSS class `b-sch-minuteIndicator` renamed to `b-sch-minute-indicator`
* CSS class `b-sch-hourIndicator` renamed to `b-sch-hour-indicator`

## BUG FIXES

* Fixed A#7153 - Adding 100 records in a loop does not extend the scroll range of the grid
* Fixed A#7167 - End date icon inconsistent with the date it's shown next to
* Fixed A#7174 - record.imageUrl should have a priority and stay as it is
* Fixed A#7185 - Readding a removed resource renders events after scroll
* Fixed A#7191 - STYLING: Wrong color in dark theme for nbr events text in resource info column
* Fixed A#7217 - group summary demo misrendering

# 1.1.1 - 2018-11-16

## FEATURES / ENHANCEMENTS

* New drag drop demo showing how to drag objects from outside the scheduler onto scheduled tasks (fixed A#7139)
* The Angular wrapper now includes @Input for `eventBodyTemplate`, `crudManager`, `eventStore`, `resourceStore`,
  `assignmentStore` and `dependencyStore`
* New pan feature added (Fixed A#6665)
* New `drag-between-schedulers` demo showing how you can drag and drop tasks between multiple Schedulers

## API CHANGES

* Calling TimeSpan#startDate setter and TimeSpan#setStartDate will now move the span in time as opposed to earlier where
  it would modify the duration of the event

## BUG FIXES

* Fixed A#7003 - Vue wrapper naming collision
* Fixed A#7120 - Cannot use ids containing "-" on events or resources
* Fixed A#7125 - Export feature doesn't export correct data by default
* Fixed A#7129 - Crash when localizing time units
* Fixed A#7130 - Web Components demo throws 404s
* Fixed A#7132 - Setting start date > end date results in negative duration
* Fixed A#7136 - Duration field should spin on up/down keys
* Fixed A#7143 - Strange scroller behavior in dragfromgrid demo
* Fixed A#7147 - When record is removed from context menu focus should move to next event

# 1.1.0 - 2018-11-09

## FEATURES / ENHANCEMENTS

* React demo bumped to latest react and styling improved
* Built in FontAwesome version bumped to 5.4.1, scope changed from .fa -> .b-fa to not affect icons outside of our
  widgets
* New `tooltips` demo showing how to customize the event tooltip
* New `validation` demo showing how to validate drag drop & resizing operations
* New Export to Excel demo (Fixed A#6961)

## API CHANGES

* `Scheduler` has a new `parter` config which pairs the `Scheduler` with the passed `Scheduler`, sharing the
  `TimeAxis`, and synchronizing the horizontal scroll positions
* Scheduler now defaults to remove the event when removing its last assignment. This behaviour can be changed using the
  `removeUnassignedEvent` config
* Scheduler has a new `triggerSelectionChangeOnRemove` config that determines if `eventSelectionChange` should trigger
  or not when removing a selected event
* [BREAKING] ViewPresets property `timeColumnWidth` and related getters and setters was renamed to `tickWidth`
  `timeColumnWidth` can still be used for backwards compatibility, but if you are using a custom ViewPreset we recommend
  that you rename to be future proof
* [BREAKING] EventDrag#validatorFn now receives the drag context in one context object (similar to dragCreate and
  eventResize features), instead of multiple params
* [DEPRECATED] In the context object parameter (first param) of the EventResize#validatorFn, 'start' and 'end' were
  deprecated in favor of 'startDate' + 'endDate'
* [DEPRECATED] In the context object parameter (first param) of the EventDragCreate#validatorFn, 'start' and 'end' were
  deprecated in favor of 'startDate' + 'endDate'
* [DEPRECATED] In the `eventpartialresize` context object, the 'start' and 'end' were deprecated in favor of 'startDate'
    + 'endDate'
* [DEPRECATED] TimeSpan#shift method now has switched position of the `amount` and `unit` params (Fixed A#7031)
* [DEPRECATED] Scheduler#viewportresize event was deprecated in favor of #timelineviewportresize (Fixed A#7046)
* [BREAKING] In the SchedulerEventRendering#eventRenderer template method, the `columnIndex` property of the `detail`
  object was made private
* [BREAKING] In the SchedulerEventRendering#eventRenderer template method, the following properties of the
  `detail.tplData` object were made private: `start`, `end`, `startMs`, `endMs`, `startsOutsideView`, `endOutsideView`,
  `resourceId`, `resource`, `id` and `eventId`. A new `height` property was added to `tplData` which lets your read the
  event height

## BUG FIXES

* Fixed A#6098 - Scheduler may be partnered with another Scheduler to share TimeAxis and scroll position
* Fixed A#6720 - Schedule and timeaxis out of sync after calling scrollEventIntoView
* Fixed A#6723 - Dependency lines for events which have been deleted reappear when the scheduler subgrid is scrolled
* Fixed A#6731 - Our CSS rules should be all scoped to apply inside .b-widget
* Fixed A#6814 - Editing an event's startDate to make it outside of the rendered event zone doesn't hide the event
* Fixed A#6906 - Theme demo not rendering correctly
* Fixed A#6980 - Maximum value violation warning seen in event editor
* Fixed A#6990 - When resize triggers multiple events update, extra terminals got rendered into resized element, growing
  uncontrollably
* Fixed A#7000 - Hardcoded z-index for focused event
* Fixed A#7005 - Hover should not be triggered on events during drag create
* Fixed A#7006 - Calling dependencyStore.removeAll() does not remove dependency lines from view
* Fixed A#7009 - New dependency gets removed from the view on scroll
* Fixed A#7019 - DST transition problem
* Fixed A#7021 - Copy DST fix + test from ExtScheduler 6.x
* Fixed A#7024 - Dependency lines are missing after zoom in/out
* Fixed A#7029 - Selected event styling not working when using labels
* Fixed A#7037 - Events rendered slightly off their start dates
* Fixed A#7050 - EventEdit feature should pass false to extendTimeAxis option to scrollResourceEventIntoView
* Fixed A#7048 - Scheduler: Drag/drop resizes task when task is small
* Fixed A#7070 - Crash when assigning from unexisting resourceId back to valid resourceId
* Fixed A#7072 - eventStore#removeAll doesn't refresh UI
* Fixed A#7074 - Deleting row does not repaint events properly

# 1.0.4 - 2018-10-08

## FEATURES / ENHANCEMENTS

* Angular demo improved: relays more events from the engine, added eventLayout config
* Vue demo improved: added more configs and improved styling
* Functions for shifting time in the time axis documented and exposed on Scheduler: `shift()`, `shiftNext()`,
  `shiftPrev()`and `setTimespan()`. These functions are used in the timeresolution demo

## BUG FIXES

* Fixed A#6770 - Loadmask not working when using crudManager
* Fixed A#6803 - EventEditor setting end date/time does not adjust the duration field
* Fixed A#6848 - Should create new record even if resource field is not shown in Editor
* Fixed A#6852 - Hovered event has wrong z-index when dragging
* Fixed A#6856 - "Container is not defined" in docs
* Fixed A#6857 - Crash in docs when collapsing group
* Fixed A#6860 - online webcomponents demo doesn't load polyfill for firefox
* Fixed A#6871 - ExtraWidgets position is wrong in EventEdit feature
* Fixed A#6889 - Missing APIs in docs
* Fixed A#6912 - Changing event start time via typing should move the event

# 1.0.3 - 2018-10-01

## FEATURES / ENHANCEMENTS

* Added a new demo - "Nested events"
* Added demos for Angular 1, 2, 4, 5 and 6

## BUG FIXES

* Fixed A#6787 - Invalid drop should make no influence on event changing
* Fixed A#6816 - Add polyfills to webcomponents demo to make it work in all browsers
* Fixed A#6820 - Crash in filter demo when typing regex chars
* Fixed A#6826 - Cache buster needed for docs app.js

# 1.0.2 - 2018-09-24

## BUG FIXES

* Fixed A#6779 - Link to react_build demo gives 404
* Fixed A#6783 - Date picker in header context menu produces inconsistent results
* Fixed A#6788 - Event editor doesn't allow setting a start date greater than end date
* Fixed A#6795 - Examples online do not work in edge
* Fixed A#6798 - Scheduler doc 404 on Scheduler/column/ResourceInfoColumn
* Fixed A#6801 - Grid vs Scheduler feature collision in docs
* Fixed A#6808 - Locales broken in react demo

# 1.0.1 - 2018-09-20

## BUG FIXES

* Fixed A#6706 - Modification date in guides restyled
* Fixed A#6735 - Name not shown in newly added task
* Fixed A#6774 - Enter key in an event editor triggers side effect

# 1.0.0 - 2018-09-13

* We're happy to announce the first v1.0.0 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation

## FEATURES / ENHANCEMENTS

* Multi assignment support added, see multiassign demo (A#4460)

# 1.0.0-rc-1 - 2018-09-06

## BUG FIXES

* Fixed A#6682 - Drag drop not working on iPhone
* Fixed a bug that prevented dependencies from being redrawn when dragging events

# 1.0.0-beta-7 - 2018-09-01

## BUG FIXES

* Fixed an obfuscation bug related to event selection

# 1.0.0-beta-6 - 2018-08-30

* We're happy to announce the v1.0.0-beta6 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation

## FEATURES / ENHANCEMENTS

* scheduler.modules.js bundle and related demos are now included in trial

## BUG FIXES

* Fixed A#6638 - Create angular demo for trial bundle
* Fixed A#6660 - Demos should shown "unknown" generic image for names not known

# 1.0.0-beta-5 - 2018-08-24

* We're happy to announce the v1.0.0-beta5 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation
* This release keeps scheduler up to date with recent changes in Bryntum Grid, on which it is based

# 1.0.0-beta-4 - 2018-08-21

* We're happy to announce the v1.0.0-beta4 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation

## FEATURES / ENHANCEMENTS

* Fixed A#6448 - Localization guide must show how to localize all date formats

## BUG FIXES

* Fixed A#6605 - Cannot read property 'start' of null
* Fixed A#6607 - Crash in column header context menu date picker
* extjsmodern demo fixed in IE11
* Prevented some dependencies from being drawn twice

# 1.0.0-beta-3 - 2018-08-01

* We're happy to announce the v1.0.0-beta3 release of our new Scheduler component. The Scheduler is a modern and high
  performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you are
  already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation
* The tests in this version has been updated to work with Siesta 5.0

## BUG FIXES

* Fixed A#6528 - Dependency rendering broken when scrolling

# 1.0.0-beta-2 - 2018-07-31

* We're happy to announce the first v1.0.0-beta2 release of our new Scheduler component. The Scheduler is a modern and
  high performance scheduling UI component. Built from the ground up with pure javascript, supporting any framework you
  are already using (incl. React, Angular and Vue). Please see our website and documentation for a full presentation

## BUG FIXES

* Fixed A#6483 - Clock image in tooltip is not fully round
* Fixed A#6484 - Tooltip shown for deleted event video
* Fixed A#6488 - Time resolution demo, snap checkbox not vertically aligned with sliders

# 1.0.0-alpha-2 - 2018-07-02

## BUG FIXES

* Fixed A#6459 - Group header z-index and background adjusted
* Fixed A#6487 - Event Editor doesn't fit text of date fields
* Fixed A#6489 - Milestone outline styling fixed for event style "line"