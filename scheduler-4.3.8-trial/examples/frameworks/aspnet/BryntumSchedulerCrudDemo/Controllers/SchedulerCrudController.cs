using Bryntum.CRUD.Response;
using Bryntum.Scheduler;
using Bryntum.Scheduler.Request;
using Bryntum.Scheduler.Request.Handler;
using Bryntum.Scheduler.Response;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BryntumSchedulerCrudDemo.Controllers
{
    public class SchedulerCrudController : Controller
    {
        public const string dateFormat = "yyyy-MM-dd\\THH:mm:ss";

        /// <summary>
        /// Helper method to get POST request body.
        /// </summary>
        /// <returns>POST request body.</returns>
        private string getPostBody()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            return new StreamReader(req).ReadToEnd();
        }

        /// <summary>
        /// Load request handler.
        /// </summary>
        /// <returns>JSON encoded response.</returns>
        [System.Web.Mvc.HttpGet]
        public ActionResult Load()
        {
            SchedulerLoadRequest loadRequest = null;
            ulong? requestId = null;

            try
            {
                string json = Request.QueryString.Get("q");

                var scheduler = new Scheduler();

                // decode request object
                try
                {
                    loadRequest = JsonConvert.DeserializeObject<SchedulerLoadRequest>(json);
                }
                catch (Exception)
                {
                    throw new Exception("Invalid load JSON");
                }

                // get request identifier
                requestId = loadRequest.requestId;

                // initialize response object
                var loadResponse = new SchedulerLoadResponse(requestId);

                if (loadRequest.events != null) loadResponse.setEvents(scheduler.getEvents());
                if (loadRequest.resources != null)
                {
                    loadResponse.setResources(
                        loadRequest.resources.Keys.Contains("page")
                            ? scheduler.getResources(Convert.ToInt32(loadRequest.resources["page"]), Convert.ToInt32(loadRequest.resources["pageSize"]))
                            : scheduler.getResources(),
                        scheduler.getResourceCount()
                    );
                }

                // put current server revision to the response
                loadResponse.revision = scheduler.getRevision();

                // just in case we make any changes during load request processing
                scheduler.context.SaveChanges();

                return Content(JsonConvert.SerializeObject(loadResponse, new JsonSerializerSettings()
                {
                    DateTimeZoneHandling = DateTimeZoneHandling.Utc
                }), "application/json");
            }
            catch (Exception e)
            {
                return Content(JsonConvert.SerializeObject(new ErrorResponse(e, requestId)), "application/json");
            }
}

        /// <summary>
        /// Sync response handler.
        /// </summary>
        /// <returns>JSON encoded response.</returns>
        [System.Web.Mvc.HttpPost]
        public ActionResult Sync()
        {
            ulong? requestId = null;
            SchedulerSyncRequest syncRequest = null;

            //try
            //{
                string json = getPostBody();

                var scheduler = new Scheduler();

                // decode request object
                try
                {
                    syncRequest = JsonConvert.DeserializeObject<SchedulerSyncRequest>(json, new Newtonsoft.Json.Converters.IsoDateTimeConverter { DateTimeFormat = dateFormat });
                }
                catch (Exception)
                {
                    throw new Exception("Invalid sync JSON");
                }

                // initialize phantom to real Id maps
                scheduler.InitRowsHolders();

                // get request identifier
                requestId = syncRequest.requestId;

                // initialize response object
                var syncResponse = new SchedulerSyncResponse(requestId);

                // Here we reject client's changes if we suspect that they are out-dated
                // considering difference between server and client revisions.
                // You can get rid of this call if you don't need such behavior.
                scheduler.checkRevision(syncRequest.revision);

                // if a corresponding store modified data are provided then we handle them

                ResourceSyncHandler resourcesHandler = null;
                if (syncRequest.resources != null)
                {
                    resourcesHandler = new ResourceSyncHandler(scheduler);
                    syncResponse.resources = resourcesHandler.Handle(syncRequest.resources, ResourceSyncHandler.Rows.AddedAndUpdated);
                }
                EventSyncHandler eventsHandler = null;
                if (syncRequest.events != null)
                {
                    eventsHandler = new EventSyncHandler(scheduler, dateFormat);
                    syncResponse.events = eventsHandler.Handle(syncRequest.events, EventSyncHandler.Rows.AddedAndUpdated);
                }

                if (syncRequest.events != null)
                    syncResponse.events = eventsHandler.HandleRemoved(syncRequest.events, syncResponse.events);

                if (syncRequest.resources != null)
                    syncResponse.resources = resourcesHandler.HandleRemoved(syncRequest.resources, syncResponse.resources);

                syncResponse.events = AddModifiedRows(scheduler, "events", syncResponse.events);
                syncResponse.resources = AddModifiedRows(scheduler, "resources", syncResponse.resources);

                // put current server revision to the response
                syncResponse.revision = scheduler.getRevision();

                scheduler.context.SaveChanges();

                return Content(JsonConvert.SerializeObject(syncResponse), "application/json");
            //}
            //catch (Exception e)
            //{
            //    return Content(JsonConvert.SerializeObject(new ErrorResponse(e, requestId)), "application/json");
            //}
        }

        protected SyncStoreResponse AddModifiedRows(Scheduler scheduler, string table, SyncStoreResponse resp)
        {
            if (scheduler.HasUpdatedRows(table))
            {
                if (resp == null) resp = new SyncStoreResponse();
                var rows = scheduler.GetUpdatedRows(table);
                resp.rows = resp.rows != null ? resp.rows.Concat(rows).ToList() : rows;
            }
            if (scheduler.HasRemovedRows(table))
            {
                if (resp == null) resp = new SyncStoreResponse();
                var removed = scheduler.GetRemovedRows(table);
                resp.removed = resp.removed != null ? resp.removed.Concat(removed).ToList() : removed;
            }
            return resp;
        }

        /// <summary>
        /// Back-end test handler providing database cleanup.
        /// TODO: WARNING! This code clears the database. Please get rid of this code before running it on production.
        /// </summary>
        /// <returns>Empty string.</returns>
        public string Reset()
        {
            var scheduler = new Scheduler();

            scheduler.Reset();
            scheduler.context.SaveChanges();

            return "";
        }
    }
}