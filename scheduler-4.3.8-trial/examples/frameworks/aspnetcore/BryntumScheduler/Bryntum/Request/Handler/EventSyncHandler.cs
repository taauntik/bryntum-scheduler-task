using Bryntum.CRUD.Request;
using System;
using System.Collections.Generic;

namespace Bryntum.Scheduler.Request.Handler
{
    public class EventSyncHandler : SyncStoreRequestHandler<Event> {

        private Scheduler Scheduler;

        public EventSyncHandler(Scheduler Scheduler, string dateFormat) : base(dateFormat) {
            this.Scheduler = Scheduler;
        }

        public override Event GetEntity(IDictionary<String, Object> changes) {
            return Scheduler.GetEvent(Convert.ToInt32(changes["Id"]));
        }

        protected IDictionary<String, Object> PrepareData(Event eventRecord)
        {
            // initialize returning hash
            IDictionary<String, Object> result = new Dictionary<String, Object>();

            var phantomResourceId = eventRecord.PhantomResourceId;
            if (eventRecord.resourceId == 0 && !String.IsNullOrEmpty(phantomResourceId))
            {
                int? resourceId = Scheduler.GetResourceIdByPhantom(phantomResourceId);
                eventRecord.resourceId = resourceId.Value;
                result.Add("ResourceId", resourceId);
            }

            return result;
        }

        public override IDictionary<String, Object> Add(Event eventRecord) {
            IDictionary<String, Object> response = PrepareData(eventRecord);

            Scheduler.SaveEvent(eventRecord);

            return response;
        }

        public override IDictionary<String, Object> Update(Event eventRecord, IDictionary<String, Object> changes)
        {
            if (changes.ContainsKey("Cls")) eventRecord.Cls = (string)changes["Cls"];
            if (changes.ContainsKey("Name")) eventRecord.Name = (string)changes["Name"];
            if (changes.ContainsKey("StartDate")) eventRecord.StartDate = (DateTime)changes["StartDate"];
            if (changes.ContainsKey("EndDate")) eventRecord.EndDate = (DateTime)changes["EndDate"];
            if (changes.ContainsKey("Draggable")) eventRecord.Draggable = Convert.ToBoolean(changes["Draggable"]);
            if (changes.ContainsKey("Resizable")) eventRecord.Resizable = Convert.ToBoolean(changes["Resizable"]);
            if (changes.ContainsKey("ResourceId")) eventRecord.ResourceId = Convert.ToString(changes["ResourceId"]);

            IDictionary<String, Object> response = PrepareData(eventRecord);

            Scheduler.SaveEvent(eventRecord);

            return response;
        }

        public override IDictionary<String, Object> Remove(Event eventRecord)
        {
            Scheduler.RemoveEvent(eventRecord);
            return new Dictionary<String, Object>();
        }
    }
}
