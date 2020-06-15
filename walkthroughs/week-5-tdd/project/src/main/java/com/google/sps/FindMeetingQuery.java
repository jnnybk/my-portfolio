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

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    // throw new UnsupportedOperationException("TODO: Implement this method.");
    
    List<TimeRange> availableTimeRanges = new ArrayList();
    Set<String> allAttendees = new HashSet();

    for (Event event: events) {
      allAttendees.addAll(event.getAttendees());
    }
    
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return availableTimeRanges;
    }

    if (Collections.disjoint(request.getAttendees(), allAttendees)) {
      availableTimeRanges.add(TimeRange.fromStartEnd(TimeRange.START_OF_DAY, TimeRange.END_OF_DAY, true));
      return availableTimeRanges;
    }

    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return Collections.EMPTY_LIST;
    } else {
      List<Event> eventsList = new ArrayList(events);


      Collections.sort(eventsList, Comparator.comparing(Event::getWhen, TimeRange.ORDER_BY_START));

      for (int i = 1; i < eventsList.size(); i++) {
        if (eventsList.get(i-1).getWhen().contains(eventsList.get(i).getWhen())) {
          eventsList.remove(i);
        }
      }

      int startTime = TimeRange.START_OF_DAY;
      int endTime = TimeRange.END_OF_DAY;
      for (int i = 0; i < eventsList.size(); i++) {
        if (eventsList.get(i).getWhen().start() - startTime >= request.getDuration()) {
          availableTimeRanges.add(TimeRange.fromStartEnd(startTime, eventsList.get(i).getWhen().start(), false));
        }
        startTime = eventsList.get(i).getWhen().end();
      }

      if (eventsList.get(eventsList.size()-1).getWhen().end() != 1440) {
        availableTimeRanges.add(TimeRange.fromStartEnd(eventsList.get(eventsList.size()-1).getWhen().end(), endTime, true));
      }
      return availableTimeRanges;
    }
  }
}
