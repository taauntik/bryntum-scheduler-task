namespace Bryntum.Scheduler.Exception
{
    /// <summary>
    /// Contains possible values of CrudException codes.
    /// </summary>
    public static class SchedulerCodes {
        /// <summary>
        /// Error of event updating.
        /// </summary>
        public static int UPDATE_EVENT = 20;

        /// <summary>
        /// Error of event adding.
        /// </summary>
        public static int ADD_EVENT = 21;
        
        /// <summary>
        /// Error of event removing.
        /// </summary>
        public static int REMOVE_EVENT = 22;
        
        /// <summary>
        /// Error of events list getting.
        /// </summary>
        public static int GET_EVENTS = 23;

        public static int EVENT_NOT_FOUND = 24;
        
        /// <summary>
        /// Error of resource updating.
        /// </summary>
        public static int UPDATE_RESOURCE = 30;
        
        /// <summary>
        /// Error of resource adding.
        /// </summary>
        public static int ADD_RESOURCE = 31;
        
        /// <summary>
        /// Error of resource removing.
        /// </summary>
        public static int REMOVE_RESOURCE = 32;

        /// <summary>
        /// Error when removing assigned resource
        /// </summary>
        public static int REMOVE_USED_RESOURCE = 33;
        
        /// <summary>
        /// Error of resources list getting.
        /// </summary>
        public static int GET_RESOURCES = 34;

        public static int RESOURCE_NOT_FOUND = 35;
    }
}
