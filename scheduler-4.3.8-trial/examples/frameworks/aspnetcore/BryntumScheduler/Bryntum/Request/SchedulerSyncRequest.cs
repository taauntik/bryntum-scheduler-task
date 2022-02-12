using Bryntum.CRUD.Request;

namespace Bryntum.Scheduler.Request
{
    public class SchedulerSyncRequest : SyncRequest {
        /// <summary>
        /// Resource store changes.
        /// </summary>
        public SyncStoreRequest<Resource> resources;

        /// <summary>
        /// Event store changes.
        /// </summary>
        public SyncStoreRequest<Event> events;
    }
}
