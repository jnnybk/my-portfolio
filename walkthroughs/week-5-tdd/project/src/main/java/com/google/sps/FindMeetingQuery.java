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

  public Set<String> getAllAttendees(Collection<Event> events) {
    Set<String> allAttendees = new HashSet();
    for (Event event: events) {
      allAttendees.addAll(event.getAttendees());
    }
    return allAttendees;
  }

  public boolean hasNoOverlappingAttendees(Collection<String> requesters, Set<String> attendees) {
    return Collections.disjoint(requesters, attendees);
  }

  public List<Event> createSortedEventsListOfMandatory(Collection<Event> events, Set<String> optionalAttendees) {
    List<Event> eventsList = new ArrayList(events);
    int i = 0;
    while (i < eventsList.size()) {
      if (eventsList.get(i).getAttendees().equals(optionalAttendees)) {
        eventsList.remove(i); 
      } else {
        i++;
      }
    }
    return eventsList;
  }

  public List<Event> createSortedEventsListOfMandatoryAndOptional(Collection<Event> events) {
    List<Event> eventsList = new ArrayList(events);
    Collections.sort(eventsList, Comparator.comparing(Event::getWhen, TimeRange.ORDER_BY_START));
    return eventsList;
  }

  /**
   * Removes nested events and overlapped. 
   * An example of a nested event is shown below (B).
   * Events:  |----A----|
   *           |--B--|
   * An example of overlapped events is shown below.
   * Events:  |----A----|
   *                 |----B----|
   */
  public void removeNestedAndOverlappedEvents(List<TimeRange> timeRangesList) {

    int i = 0;
    while (i < timeRangesList.size()-1) {
      if (timeRangesList.get(i).contains(timeRangesList.get(i+1))) {
        timeRangesList.remove(i+1);
      } else if (timeRangesList.get(i).contains(timeRangesList.get(i+1).start())) {
        int newStartTime = timeRangesList.get(i).start();
        int newEndTime = timeRangesList.get(i+1).end();
        timeRangesList.remove(i);
        timeRangesList.remove(i);
        timeRangesList.add(i, TimeRange.fromStartEnd(newStartTime, newEndTime, false));
      } else {
        i++;
      }
    }
  }

  public boolean isRequestDurationTooLong(MeetingRequest request) {
    // Meeting request duration should never be longer than a day.
    return request.getDuration() > TimeRange.WHOLE_DAY.duration();
  }

  public void addAvailableTimeRanges(List<TimeRange> availableTimeRanges, List<TimeRange> timeRangesList, MeetingRequest request) {
    int startTime = TimeRange.START_OF_DAY;
    int endTime = TimeRange.END_OF_DAY;
    
    for (int i = 0; i < timeRangesList.size(); i++) {
      if (timeRangesList.get(i).start() - startTime >= request.getDuration()) {
        availableTimeRanges.add(TimeRange.fromStartEnd(startTime, timeRangesList.get(i).start(), false));
      }
      startTime = timeRangesList.get(i).end();
    }

    if (timeRangesList.get(timeRangesList.size()-1).end() != endTime + 1) {
      availableTimeRanges.add(TimeRange.fromStartEnd(timeRangesList.get(timeRangesList.size()-1).end(), endTime, true));
    }
  }

  public List<TimeRange> findTimeRangesOfEvents(List<Event> eventsList) {
    List<TimeRange> timeRangesList = new ArrayList();

    for (Event event: eventsList) {
      timeRangesList.add(TimeRange.fromStartEnd(event.getWhen().start(), event.getWhen().end(), false));
    }
    return timeRangesList;
  }

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    Set<String> optionalAttendees = new HashSet(request.getOptionalAttendees());
    Set<String> allAttendees = getAllAttendees(events);
    List<TimeRange> availableTimeRanges = new ArrayList();
    
    List<Event> eventsListOfMandatory = createSortedEventsListOfMandatory(events, optionalAttendees);
    List<Event> eventsListOfMandatoryAndOptional = createSortedEventsListOfMandatoryAndOptional(events);

    if (isRequestDurationTooLong(request)) {
      return availableTimeRanges;
    }

    if (hasNoOverlappingAttendees(request.getAttendees(), allAttendees)) {
      availableTimeRanges.add(TimeRange.fromStartEnd(TimeRange.START_OF_DAY, TimeRange.END_OF_DAY, true));
      return availableTimeRanges;
    }

    List<TimeRange> timeRangesList = findTimeRangesOfEvents(eventsListOfMandatoryAndOptional);
    removeNestedAndOverlappedEvents(timeRangesList);
    addAvailableTimeRanges(availableTimeRanges, timeRangesList, request);

    if (availableTimeRanges.size() == 0) {
      List<TimeRange> timeRangesListOnlyMandatory = findTimeRangesOfEvents(eventsListOfMandatory);
      removeNestedAndOverlappedEvents(timeRangesListOnlyMandatory);
      addAvailableTimeRanges(availableTimeRanges, timeRangesListOnlyMandatory, request);
    }
    return availableTimeRanges;
  }
}
