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
import com.google.appengine.api.datastore.QueryResultList;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.Entity;
import com.google.sps.data.Comment;
import com.google.sps.data.Data;
import java.lang.Integer;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private int maxNumOfComments = 0;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    try {
      maxNumOfComments = Integer.parseInt(request.getParameter("max_num_of_comments"));
    } catch (Exception e) {
      maxNumOfComments = 5;
    }
    FetchOptions fetchOptions = FetchOptions.Builder.withLimit(maxNumOfComments);
    String startCursor = request.getParameter("cursor");
    if (startCursor != null ) {
      fetchOptions.startCursor(Cursor.fromWebSafeString(startCursor));
    }

    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    QueryResultList<Entity> queryResults;

    try {
      queryResults = results.asQueryResultList(fetchOptions);
    } catch (IllegalArgumentException e) {
      // I redirect to the /data URL with cursor as null to handle invalid cursors.
      response.sendRedirect("/data?max_num_of_comments=" + maxNumOfComments + "&cursor=");
      return;
    }
    List<Comment> comments = new ArrayList<>();
    for (Entity entity: results.asIterable(fetchOptions)) {
      String userName = (String) entity.getProperty("userName");
      String userComment = (String) entity.getProperty("userComment");
      String userEmail = (String) entity.getProperty("userEmail");
      long timestamp = (long) entity.getProperty("timestamp");
      long id = (long) entity.getKey().getId();

      Comment comment = new Comment(userName, userComment, userEmail, timestamp, id);
      comments.add(comment);
    }

    String cursorString = queryResults.getCursor().toWebSafeString();
    Gson gson = new Gson();

    Data data = new Data(comments, cursorString);
    String json = gson.toJson(data);

    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    UserService userService = UserServiceFactory.getUserService();

    String userName = request.getParameter("user_name");
    String userComment = request.getParameter("user_comment");
    String userEmail = "";
    if (userService.isUserLoggedIn()) {
      userEmail = userService.getCurrentUser().getEmail();
    }
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
    commentEntity.setProperty("userEmail", userEmail);
    commentEntity.setProperty("timestamp", timestamp);
    datastore.put(commentEntity);
    
    response.sendRedirect("/index.html");
  }

}
