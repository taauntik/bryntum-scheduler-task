/* global shared */
shared.fireMouseEvent('mouseover', document.querySelector('[data-event-id="e22"]').firstElementChild);
shared.fireMouseEvent('mousedown', document.querySelector('[data-event-id="e22"] [data-side="right"]'));
shared.fireMouseEvent('mousemove', document.querySelector('[data-event-id="4"]'));

shared.fireMouseEvent('mouseover', document.querySelector('[data-event-id="4"]').firstElementChild);
shared.fireMouseEvent('mousemove', document.querySelector('[data-event-id="4"] [data-side="left"]'));

// raise flag for thumb generator indicating page is ready for taking screenshot
window.__thumb_ready = true;
