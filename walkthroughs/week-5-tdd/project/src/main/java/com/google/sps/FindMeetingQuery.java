// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.Collection;
import java.util.Collections;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;
import java.util.Set;
import java.util.HashSet;

public final class FindMeetingQuery {

  /**
   * Returns a set of attendees for all events in collection.
   */
  public Set<String> getAllAttendees(Collection<Event> events) {
    Set<String> allAttendees = new HashSet();
    for (Event event: events) {
      allAttendees.addAll(event.getAttendees());
    }
    return allAttendees;
  }

  /**
   * Returns true if requesters and attendees do not overlap.
   */
  public boolean hasOverlappingAttendees(Collection<String> requesters, Set<String> attendees) {
    return Collections.disjoint(requesters, attendees);
  }

  /**
   * Returns a list of events sorted by their start times.
   */
  public List<Event> createSortedEventsList(Collection<Event> events) {
    List<Event> eventsList = new ArrayList(events);
    Collections.sort(eventsList, Comparator.comparing(Event::getWhen, TimeRange.ORDER_BY_START));
    return eventsList;
  }

  /**
   * Removes nested events. An example of a nested event is shown below (B).
   * Events:  |----A----|
   *           |--B--|
   */
  public void removeNestedEvents(List<Event> eventsList) {
    for (int i = 1; i < eventsList.size(); i++) {
      if (eventsList.get(i-1).getWhen().contains(eventsList.get(i).getWhen())) {
        eventsList.remove(i);
      }
    }
  }

  /**
   * Returns true if the request duration is longer than a day. Meeting request duration should never be longer than a day.
   */
  public boolean isRequestDurationTooLong(MeetingRequest request) {
    return request.getDuration() > TimeRange.WHOLE_DAY.duration();
  }

  /**
   * Adds available times to list of TimeRanges.
   */
  public void addAvailableTimeRanges(List<TimeRange> availableTimeRanges, List<Event> eventsList, MeetingRequest request) {
    int startTime = TimeRange.START_OF_DAY;
    int endTime = TimeRange.END_OF_DAY;

    for (int i = 0; i < eventsList.size(); i++) {
      // If true, event at i and event at i-1 (if i is not 0) overlap.
      if (eventsList.get(i).getWhen().start() - startTime >= request.getDuration()) {
        availableTimeRanges.add(TimeRange.fromStartEnd(startTime, eventsList.get(i).getWhen().start(), false));
      }
      startTime = eventsList.get(i).getWhen().end();
    }
    // Handles the last TimeRange from the end of the last event to the end of the day (if they are not equal).
    if (eventsList.get(eventsList.size()-1).getWhen().end() != endTime + 1) {
      availableTimeRanges.add(TimeRange.fromStartEnd(eventsList.get(eventsList.size()-1).getWhen().end(), endTime, true));
    }
  }

  /**
   * Returns a list of available TimeRanges, handling nested / overlapping events.
   */
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    List<TimeRange> availableTimeRanges = new ArrayList();
    Set<String> allAttendees = getAllAttendees(events);
    List<Event> eventsList = createSortedEventsList(events);

    if (isRequestDurationTooLong(request)) {
      return availableTimeRanges;
    }

    if (hasOverlappingAttendees(request.getAttendees(), allAttendees)) {
      availableTimeRanges.add(TimeRange.fromStartEnd(TimeRange.START_OF_DAY, TimeRange.END_OF_DAY, true));
      return availableTimeRanges;
    }

    removeNestedEvents(eventsList);

    addAvailableTimeRanges(availableTimeRanges, eventsList, request);

    return availableTimeRanges;
  }
}
