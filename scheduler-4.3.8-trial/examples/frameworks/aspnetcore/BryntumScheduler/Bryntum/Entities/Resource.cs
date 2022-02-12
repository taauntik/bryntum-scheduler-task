using Bryntum.CRUD.Entities;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Bryntum.Scheduler
{
    public partial class Resource : General, IResourceMetadata
    {
    }

    public interface IResourceMetadata {
        [JsonIgnore]
        public ICollection<Event> events { get; set; }
    }
}
