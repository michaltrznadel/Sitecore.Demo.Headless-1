import { isDisconnected, isConnectedToLocalInstance } from "../util";
import { get, getActionUrl, boxeverGet, boxeverPost, boxeverDelete } from "./GenericService";
import { getGuestRef, getPersonalizedEvents } from "./BoxeverService";

export function addToFavorites(eventId, eventName) {
  return getGuestRef().then(response => {
    return boxeverPost(
      "/createguestdataextension?guestRef="+ response.guestRef + "&dataExtensionName=FavoriteEvents",
      {
        "key":eventName + " / " + eventId,
        "eventId":eventId
      }
    );
  }).catch(e => {
    console.log(e);
  });
}

export function removeFromFavorites(eventId, eventName) {
  return getGuestRef().then(response => {
    return boxeverDelete(
      "/deletekeyforguestdataextension?guestRef="+ response.guestRef + "&dataExtensionName=FavoriteEvents",
      {
        "key":eventName + " / " + eventId
      }
    );
  }).catch(e => {
    console.log(e);
  });
}

export function register(eventName, eventId, sportType, eventDate) {
  return getGuestRef().then(response => {
    return boxeverPost(
      "/createguestdataextension?guestRef="+ response.guestRef + "&dataExtensionName=RegisteredEvents",
      {
        "key":eventName + " / " + eventId,
        "Event Name":eventName,
        "Event Id":eventId
      }
    );
  }).catch(e => {
    console.log(e);
  });
}

export function unregister(eventId, eventName) {
  return getGuestRef().then(response => {
    return boxeverDelete(
      "/deletekeyforguestdataextension?guestRef="+ response.guestRef + "&dataExtensionName=RegisteredEvents",
      {
        "key":eventName + " / " + eventId
      }
    );
  }).catch(e => {
    console.log(e);
  });
}

function paginateEvents(take, skip, eventsResponse) {
  // TODO: Validate this skip/take logic is working as expected.
  if (skip >= eventsResponse.total) {
    eventsResponse.events = [];
  } else if (skip + take > eventsResponse.total) {
    eventsResponse.events = eventsResponse.events.slice(skip);
  } else {
    eventsResponse.events = eventsResponse.events.slice(skip, take);
  }

  return eventsResponse;
}

export function getAll(take, skip, lat, lng, profiles, personalize) {
  if (isDisconnected()) {
    // Return fake events data in disconnected mode

    console.log("Getting non-personalized events from fake data as we are running in disconnected mode.");

    return get(`/events`, { }, false)
    .then(response => {
      const paginatedEvents = paginateEvents(take, skip, response.data);

      // The callers expect the events inside a data object key
      return {
        data: paginatedEvents
      };
    });
  }

  const filteredSportsPayload = {
    lat,
    lng
  };

  if (profiles && profiles.length > 0) {
    filteredSportsPayload.profiles = profiles.join("|");
  }

  const isConnectedSitecoreInstanceLocal = isConnectedToLocalInstance();
  if (isConnectedSitecoreInstanceLocal) {
    // The connected mode Sitecore instance is running on Docker on a developer machine and is unreachable from the Internet.
    console.log("Getting non-personalized events from Sitecore as we are running in connected mode to a local Sitecore instance.");
  }
  const shouldNotPersonalize = !personalize;
  if (shouldNotPersonalize) {
    console.log("Getting non-personalized events from Sitecore as the UI component is configured to get non-personalized events.");
  }

  if (isConnectedSitecoreInstanceLocal || shouldNotPersonalize) {
    filteredSportsPayload.take = take;
    filteredSportsPayload.skip = skip;

    return get(`/events`, filteredSportsPayload, false);
  }

  // The app and Sitecore instance are accessible from the Internet and personalized events are desired.
  // Ask Boxever to get the events from the Sitecore instance and personalize them.
  const eventsApiUrl = getActionUrl(`/events`).replaceAll("{", "%7B").replaceAll("}", "%7D");

  return getPersonalizedEvents(eventsApiUrl, filteredSportsPayload)
  .then(response => {
    const formattedEvents = {
      // Boxever returns events as an object instead of an array. We must convert it to an array.
      events: Object.values(response.events),
      total: response.total
    };

    const paginatedEvents = paginateEvents(take, skip, formattedEvents);

    // The callers expect the events inside a data object key
    return {
      data: paginatedEvents
    };
  });
}

export function getRegisteredEvents() {
  return getGuestRef()
  .then(response => {
    return boxeverGet(
      "/getguestdataextensionexpanded?guestRef="+ response.guestRef + "&dataExtensionName=RegisteredEvents", {}
    );
  })
  .then(data => {
    var extData = data.data.extRegisteredEvents.items;
    var eventIds = extData.map(x => x.EventId);
    var events = eventIds.join(",");
    return get(`/events/GetEventsById`, events, false);
  })
  .catch(e => {
    console.log(e);
  });
}

export function getFavoritedEvents() {
  return getGuestRef()
  .then(response => {
    return boxeverGet(
      "/getguestdataextensionexpanded?guestRef="+ response.guestRef + "&dataExtensionName=FavoriteEvents", {}
    );
  })
  .then(data => {
    var extData = data.data.extFavoriteEvents.items;
    var eventIds = extData.map(x => x.EventId);
    var events = eventIds.join(",");
    return get(`/events/GetEventsById`, events, false);
  })
  .catch(e => {
    console.log(e);
  });
}
