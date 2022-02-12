using Bryntum.CRUD.Response;

namespace Bryntum.Scheduler.Response
{
    public class SchedulerSyncResponse : SyncResponse {

        public SyncStoreResponse resources { get; set; }

        public SyncStoreResponse events { get; set; }

        public SchedulerSyncResponse()
            : base()
        {
        }

        public SchedulerSyncResponse(ulong? requestId) : base(requestId) {
        }
    }
}
