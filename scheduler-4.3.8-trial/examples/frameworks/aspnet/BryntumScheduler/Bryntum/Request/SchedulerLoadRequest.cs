using Bryntum.CRUD.Request;
using System;
using System.Collections.Generic;

namespace Bryntum.Scheduler.Request
{
    /// <summary>
    /// This class implements load request structure.
    /// </summary>
    public class SchedulerLoadRequest : LoadRequest
    {
        /// <summary>
        /// Resources store request parameters.
        /// Contains null if resources store is not requested.
        /// </summary>
        public IDictionary<String, Object> resources;

        /// <summary>
        /// Events store request parameters.
        /// Contains null if events store is not requested.
        /// </summary>
        public IDictionary<String, Object> events;

        public override IList<Object> stores {
            set
            {
                base.stores = value;

                // map known Scheduler related stores properties to public fields
                resources = getStoreParams("resources");
                events = getStoreParams("events");
            }
        }
    }
}
