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

package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Entity;
import com.google.sps.data.Comment;
import java.lang.Integer;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    int maxNumberOfComments = -1;
    try {
      maxNumberOfComments = Integer.parseInt(request.getParameter("maxNumberOfComments"));
    } catch (Exception e) {
      maxNumberOfComments = 10;
    }

    List<Comment> comments = new ArrayList<>();
    int index = 0;
    for (Entity entity: results.asIterable()) {
      String userName = (String) entity.getProperty("userName");
      String userComment = (String) entity.getProperty("userComment");
      long timestamp = (long) entity.getProperty("timestamp");

      Comment comment = new Comment(userName, userComment, timestamp);
      comments.add(comment);

      index++;
      if (maxNumberOfComments == index)
        break;
    }
    Gson gson = new Gson();
    String json = gson.toJson(comments);
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    String userName = request.getParameter("user_name");
    String userComment = request.getParameter("user_comment");
    long timestamp = System.currentTimeMillis();

    if ( userName == null || userName.isEmpty() ) {
      userName = "Anonymous";
    } 
    if (userComment == null || userComment.isEmpty() ) {
      response.getWriter().println("Comment cannot be left blank.");
      return;
    }

    Entity commentEntity = new Entity("Comment");
    commentEntity.setProperty("userName", userName);
    commentEntity.setProperty("userComment", userComment);
    commentEntity.setProperty("timestamp", timestamp);
    datastore.put(commentEntity);
    
    response.sendRedirect("/index.html");
  }

}
