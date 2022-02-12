using Bryntum.CRUD.Request;
using System;
using System.Collections.Generic;

namespace Bryntum.Scheduler.Request.Handler
{
    public class ResourceSyncHandler : SyncStoreRequestHandler<Resource> {

        private Scheduler Scheduler;

        public ResourceSyncHandler(Scheduler Scheduler) {
            this.Scheduler = Scheduler;
        }

        public override Resource GetEntity(IDictionary<String, Object> changes) {
            return Scheduler.GetResource(Convert.ToInt32(changes["Id"]));
        }

        public override IDictionary<String, Object> Add(Resource resource)
        {
            Scheduler.SaveResource(resource);
            return new Dictionary<String, Object>();
        }

        public override IDictionary<String, Object> Update(Resource resource, IDictionary<String, Object> changes)
        {
            // apply changes to the entity
            if (changes.ContainsKey("Name")) resource.Name = changes["Name"] as string;
            
            Scheduler.SaveResource(resource);
            return new Dictionary<String, Object>();
        }

        public override IDictionary<String, Object> Remove(Resource resource)
        {
            Scheduler.RemoveResource(resource);
            return new Dictionary<String, Object>();
        }
    }
}
