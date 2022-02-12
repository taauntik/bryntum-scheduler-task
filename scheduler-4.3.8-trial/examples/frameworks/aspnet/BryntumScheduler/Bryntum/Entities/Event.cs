using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

namespace Bryntum.Scheduler
{
    [MetadataType(typeof(EventMetadata))]
    public partial class Event : General
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

    public class EventMetadata
    {
        [JsonIgnore]
        public virtual Resource Resource { get; set; }

        [JsonIgnore]
        public virtual int resourceId { get; set; }
    }
}
