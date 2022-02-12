/* global scheduler */
scheduler.eventStore.on('occurrencesready', () => {
    window.__thumb_ready = true;
});
