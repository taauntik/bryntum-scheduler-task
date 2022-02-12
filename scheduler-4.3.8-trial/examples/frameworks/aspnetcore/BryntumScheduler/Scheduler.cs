using Bryntum.CRUD.Exception;
using Bryntum.Scheduler;
using Bryntum.Scheduler.Exception;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Bryntum.Scheduler
{
    public class Scheduler
    {
        public SchedulerContext context;

        /// <summary>
        /// A dictionary keeping phantom to real Id references for all tables.
        /// </summary>
        public IDictionary<String, IDictionary<String, int>> AddedIds { get; set; }

        public IDictionary<String, IDictionary<int, IDictionary<string, object>>> RemovedRows { get; set; }

        public IDictionary<String, IDictionary<int, IDictionary<string, object>>> UpdatedRows { get; set; }

        public Scheduler(string connectionString)
        {
            context = new SchedulerContext(connectionString);
        }

        /// <summary>
        /// Gets a task by its identifier.
        /// </summary>
        /// <param name="id">Task identifier.</param>
        /// <returns>Task.</returns>
        public Event GetEvent(int id)
        {
            return context.Events.Find(id);
        }

        /// <summary>
        /// Gets list of existing tasks.
        /// </summary>
        /// <returns>List of tasks.</returns>
        public IEnumerable<Event> GetEvents()
        {
            return context.Events.ToList();
        }

        /// <summary>
        /// Saves a task to the database. Creates a new or updates exisitng record depending on Id value.
        /// </summary>
        /// <param name="task">Task to save.</param>
        public void SaveEvent(Event eventRecord)
        {
            if (eventRecord.Id > 0)
            {
                var entity = GetEvent(eventRecord.Id);
                if (entity == null) throw new CrudException("Cannot find event #" + eventRecord.Id, SchedulerCodes.EVENT_NOT_FOUND);

                // update record
                entity.Name = eventRecord.Name;
                entity.StartDate = eventRecord.StartDate;
                entity.EndDate = eventRecord.EndDate;
                entity.Cls = eventRecord.Cls;
                entity.Draggable = eventRecord.Draggable;
                entity.Resizable = eventRecord.Resizable;
                context.SaveChanges();
            }
            else
            {
                // create new record
                context.Events.Add(eventRecord);
                //saveTaskSegments(task, task.Segments);
                context.SaveChanges();
                // let's keep mapping from phantom to real Id
                AddedIds["events"].Add(eventRecord.PhantomId, eventRecord.Id);
            }

            UpdateRevision();
        }

        /// <summary>
        /// Removes event from the database.
        /// </summary>
        /// <param name="event">Event to remove.</param>
        public void RemoveEvent(Event eventRecord)
        {
            Event entity = GetEvent(eventRecord.Id);
            if (entity != null)
            {
                context.Events.Remove(entity);
                context.SaveChanges();
                UpdateRevision();
            }
        }

        /// <summary>
        /// Gets a resource by its identifier.
        /// </summary>
        /// <param name="id">Resource identifier.</param>
        /// <returns>Resource.</returns>
        public Resource GetResource(int id)
        {
            return context.Resources.Find(id);
        }

        /// <summary>
        /// Gets list of existing resources.
        /// </summary>
        /// <returns>List of resources.</returns>
        public IEnumerable<Resource> GetResources()
        {
            return context.Resources.ToList();
        }

        /// <summary>
        /// 
        /// </summary>
        /// 
        public IEnumerable<Resource> GetResources(int page, int pageSize)
        {
            if (page < 1) page = 1;

            return context.Resources.OrderBy(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToList();
        }

        public int GetResourceCount() 
        {
            return context.Resources.Count();
        }

        /// <summary>
        /// Saves a resource to the database. Either creates a new or updates existing record (depending on Id value).
        /// </summary>
        /// <param name="resource">Resource to save.</param>
        public void SaveResource(Resource resource)
        {
            if (resource.Id > 0)
            {
                var entity = GetResource(resource.Id);
                if (entity == null) throw new CrudException("Cannot find resource #" + resource.Id, SchedulerCodes.RESOURCE_NOT_FOUND);

                entity.Name = resource.Name;
                context.SaveChanges();
            }
            else
            {
                context.Resources.Add(resource);
                context.SaveChanges();

                // let's keep mapping from phantom to real Id
                AddedIds["resources"].Add(resource.PhantomId, resource.Id);
            }

            UpdateRevision();
        }

        /// <summary>
        /// Removes a resource from the database.
        /// </summary>
        /// <param name="resource">Resource to remove.</param>
        public void RemoveResource(Resource resource)
        {
            Resource entity = GetResource(resource.Id);
            if (entity != null)
            {
                if (entity.events.Count > 0) throw new CrudException("Cannot remove assigned resource #" + resource.Id, SchedulerCodes.REMOVE_USED_RESOURCE);
                context.Resources.Remove(entity);
                context.SaveChanges();
                UpdateRevision();
            }
        }

        /// <summary>
        /// Sets an arbitrary application option value.
        /// </summary>
        /// <param name="option">Option name.</param>
        /// <param name="val">Option value.</param>
        public void SetOption(string option, string val)
        {
            var entity = context.Options.SingleOrDefault(r => r.Name == option);
            if (entity == null)
            {
                context.Options.Add(new Option { Name = option, Value = val });
            }
            else
            {
                entity.Value = val;
            }
            context.SaveChanges();
        }

        /// <summary>
        /// Gets an application option value.
        /// </summary>
        /// <param name="option">Option name.</param>
        /// <returns>Option value.</returns>
        public string GetOption(string option)
        {
            var entity = context.Options.SingleOrDefault(r => r.Name == option);// Find(option);
            if (entity == null) throw new CrudException("Cannot get option " + option + ".", Codes.GET_OPTION);

            return entity.Value;
        }

        /// <summary>
        /// Gets current server revision stamp.
        /// </summary>
        /// <returns>Server revision stamp.</returns>
        public int GetRevision()
        {
            return Convert.ToInt32(GetOption("revision"));
        }

        /// <summary>
        /// Increments server revision stamp.
        /// </summary>
        public void UpdateRevision()
        {
            try
            {
                SetOption("revision", Convert.ToString(GetRevision() + 1));
            }
            catch (System.Exception)
            {
                throw new CrudException("Cannot update server revision stamp.", Codes.UPDATE_REVISION);
            }
        }

        /// <summary>
        /// Checks if specified revision stamp is not older than current server one.
        /// </summary>
        /// <param name="revision">Revision stamp to check.</param>
        /// <exception cref="CrudException">If specified revision is older than server one method throws CrudException with code OUTDATED_REVISION.</exception>
        public void CheckRevision(int? revision)
        {
            if (revision.HasValue && revision > 0 && GetRevision() > revision)
            {
                throw new CrudException("Client data snapshot is outdated please reload you stores before.", Codes.OUTDATED_REVISION);
            }
        }

        public void Reset()
        {
            var db = context.Database;

            db.ExecuteSqlRaw("ALTER TABLE events DROP CONSTRAINT FK_events_resources");

            db.ExecuteSqlRaw("TRUNCATE TABLE events");
            db.ExecuteSqlRaw("TRUNCATE TABLE resources");
            db.ExecuteSqlRaw("TRUNCATE TABLE options");

            db.ExecuteSqlRaw("ALTER TABLE events WITH CHECK ADD CONSTRAINT FK_events_resources FOREIGN KEY(resourceId) REFERENCES resources (id)");
            db.ExecuteSqlRaw("ALTER TABLE events CHECK CONSTRAINT FK_events_resources");

            SetOption("revision", "1");
        }

        /// <summary>
        /// Initializes structures to keep mapping between phantom and real Ids
        /// and lists of implicitly updated and removed records dictionaries.
        /// </summary>
        public void InitRowsHolders()
        {
            AddedIds = new Dictionary<String, IDictionary<string, int>>
            {
                { "events", new Dictionary<String, int>() },
                { "resources", new Dictionary<String, int>() }
            };

            UpdatedRows = new Dictionary<String, IDictionary<int, IDictionary<string, object>>>
            {
                { "events", new Dictionary<int, IDictionary<string, object>>() },
                { "resources", new Dictionary<int, IDictionary<string, object>>() }
            };

            RemovedRows = new Dictionary<String, IDictionary<int, IDictionary<string, object>>>
            {
                { "events", new Dictionary<int, IDictionary<string, object>>() },
                { "resources", new Dictionary<int, IDictionary<string, object>>() }
            };
        }

        public bool HasUpdatedRows(String table)
        {
            return UpdatedRows.ContainsKey(table) && UpdatedRows[table].Count > 0;
        }

        public IList<IDictionary<string, object>> GetUpdatedRows(String table)
        {
            if (!HasUpdatedRows(table)) return null;

            return UpdatedRows[table].Values.ToList();
        }

        public bool HasRemovedRows(String table)
        {
            return RemovedRows.ContainsKey(table) && RemovedRows[table].Count > 0;
        }

        public IList<IDictionary<string, object>> GetRemovedRows(String table)
        {
            if (!HasRemovedRows(table)) return null;

            return RemovedRows[table].Values.ToList();
        }

        /// <summary>
        /// Gets real resource identifier by specified phantom one.
        /// </summary>
        /// <param name="phantomId">Resource phantom identifier.</param>
        /// <returns>Resource real identifier.</returns>
        public int? GetResourceIdByPhantom(String phantomId)
        {
            return GetIdByPhantom("resources", phantomId);
        }

        /// <summary>
        /// Gets real record identifier matching specified phantom one.
        /// </summary>
        /// <param name="table">Table name.</param>
        /// <param name="phantomId">Phantom identifier.</param>
        /// <returns>Real record identifier.</returns>
        public int? GetIdByPhantom(String table, String phantomId)
        {
            if (!AddedIds.ContainsKey(table)) return null;
            IDictionary<String, int> map = AddedIds[table];
            if (map == null) return null;

            // get real task Id
            if (phantomId != null && map.ContainsKey(phantomId))
            {
                return map[phantomId];
            }

            return null;
        }
    }
}
