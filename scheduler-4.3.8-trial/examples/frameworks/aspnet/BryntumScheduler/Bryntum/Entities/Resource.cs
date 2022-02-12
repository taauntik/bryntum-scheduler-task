using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bryntum.Scheduler
{
    [MetadataType(typeof(ResourceMetadata))]
    public partial class Resource : General
    {
    }

    public class ResourceMetadata {
        [JsonIgnore]
        public virtual ICollection<Event> events { get; set; }
    }
}
