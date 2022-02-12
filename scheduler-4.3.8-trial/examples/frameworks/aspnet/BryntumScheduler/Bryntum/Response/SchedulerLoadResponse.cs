using Bryntum.CRUD.Response;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Bryntum.Scheduler.Response
{
    /// This class implements response for the load request.
    public class SchedulerLoadResponse : LoadResponse {
        [JsonProperty("resources", NullValueHandling = NullValueHandling.Ignore)]
        public LoadStoreResponse<Resource> resources { set; get; }
        
        [JsonProperty("events", NullValueHandling = NullValueHandling.Ignore)]
        public LoadStoreResponse<Event> events { set; get; }
        
        public SchedulerLoadResponse() : base() {
        }

        public SchedulerLoadResponse(ulong? requestId) : base(requestId) {
        }

        /// <summary>
        /// Sets list of resources to be responded.
        /// </summary>
        /// <param name="resources">List of resources.</param>
        public void setResources(IEnumerable<Resource> rows)
        {
            resources = new LoadStoreResponse<Resource>(rows);
        }

        public void setResources(IEnumerable<Resource> rows, int count)
        {
            resources = new LoadStoreResponse<Resource>(rows, count);
        }

        /// <summary>
        /// Sets list of events to be responded.
        /// </summary>
        /// <param name="tasks">List of events.</param>
        public void setEvents(IEnumerable<Event> rows)
        {
            events = new LoadStoreResponse<Event>(rows, false);
        }
    }
}
