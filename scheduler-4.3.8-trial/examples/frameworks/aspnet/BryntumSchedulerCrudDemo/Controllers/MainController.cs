using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BryntumSchedulerCrudDemo.Controllers
{
    public class MainController : Controller
    {
        //
        // GET: /Main/

        public ActionResult Index()
        {
            return Redirect(Url.Content("~/app/index.html"));
        }

    }
}
