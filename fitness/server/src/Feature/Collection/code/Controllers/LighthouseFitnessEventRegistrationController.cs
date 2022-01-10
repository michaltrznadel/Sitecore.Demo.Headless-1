﻿using System;
using System.Net;
using System.Web.Mvc;
using Sitecore.Annotations;
using Sitecore.Diagnostics;
using Sitecore.Demo.Fitness.Feature.Collection.Model;
using Sitecore.Demo.Fitness.Foundation.Analytics;
using Sitecore.Demo.Fitness.Foundation.Analytics.Filters;
using Sitecore.Demo.Fitness.Foundation.Analytics.Services;
using Sitecore.LayoutService.Mvc.Security;

namespace Sitecore.Demo.Fitness.Feature.Collection.Controllers
{
    [RequireSscApiKey]
    [ImpersonateApiKeyUser]
    [EnableApiKeyCors]
    [SuppressFormsAuthenticationRedirect]
[ServicesController][EnableCors(origins: "*", headers: "*", methods: "*")]
    public class LighthouseFitnessEventRegistrationController : ServicesApiController 
    {
        private IStringValueListFacetService facetService;

        public LighthouseFitnessEventRegistrationController([NotNull]IStringValueListFacetService facetService)
        {
            this.facetService = facetService;
        }

        [ActionName("add")]
        [HttpPost]
        [CancelCurrentPage]
        public ActionResult Add([System.Web.Http.FromBody]EventPayload data)
        {
            // TODO: move data validation
            if (!data.IsValid())
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "invalid data");
            }
            try
            {
                facetService.Add(data.EventIdFormatted, FacetIDs.RegisteredEvents);
            }
            catch (Exception ex)
            {
                Log.Error($"Unable to add value '{data.EventId}' to contact's '${FacetIDs.RegisteredEvents}' facet ", ex, this);
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.Message);
            }

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }

        [ActionName("remove")]
        [HttpPost]
        [CancelCurrentPage]
        public ActionResult Remove([System.Web.Http.FromBody]EventPayload data)
        {
            // TODO: move data validation
            if (!data.IsValid())
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, "invalid data");
            }
            try
            {
                facetService.Add(data.EventIdFormatted, FacetIDs.RegisteredEvents);
            }
            catch (Exception ex)
            {
                Log.Error($"Unable to remove value '{data.EventId}' to contact's '${FacetIDs.RegisteredEvents}' facet ", ex, this);
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, ex.Message);
            }

            return new HttpStatusCodeResult(HttpStatusCode.OK);
        }
    }
}