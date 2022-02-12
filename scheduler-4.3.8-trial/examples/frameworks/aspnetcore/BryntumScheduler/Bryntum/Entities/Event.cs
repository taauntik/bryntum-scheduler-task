using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System;

namespace Bryntum.Scheduler
{
    public partial class Event : General, IEventMetadata
    {
        [JsonIgnore]
        public string PhantomResourceId { get; set; }

        public string ResourceId
        {
            set
            {
                PhantomResourceId = value;
                if (value == null) return;

                try
                {
                    resourceId = Convert.ToInt32(value);
                    PhantomResourceId = value;
                }
                catch (System.Exception)
                {
                    resourceId = 0;
                }
            }

            get
            {
                return resourceId > 0 ? Convert.ToString(resourceId) : PhantomResourceId;
            }
        }
    }

    public interface IEventMetadata
    {
        [JsonIgnore]
        public Resource Resource { get; set; }

        [JsonIgnore]
        public int resourceId { get; set; }
    }
}
