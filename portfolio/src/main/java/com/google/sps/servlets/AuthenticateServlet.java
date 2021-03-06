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

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.sps.data.LoginInfo;

@WebServlet("/login")
public class AuthenticateServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    Gson gson = new Gson();

    UserService userService = UserServiceFactory.getUserService();
    boolean isUserLoggedIn = userService.isUserLoggedIn();
    if (isUserLoggedIn) {
      String userEmail = userService.getCurrentUser().getEmail();
      String urlToRedirectAfterLogOut = "/";
      String logoutUrl = userService.createLogoutURL(urlToRedirectAfterLogOut);
      
      LoginInfo loginInfo = new LoginInfo(isUserLoggedIn, logoutUrl);
      String json = gson.toJson(loginInfo);
      response.getWriter().println(json);
    } else {
      String urlToRedirectAfterLogIn = "/";
      String loginUrl = userService.createLoginURL(urlToRedirectAfterLogIn);

      LoginInfo loginInfo = new LoginInfo(isUserLoggedIn, loginUrl);
      String json = gson.toJson(loginInfo);
      response.getWriter().println(json);
    }
  }
}
