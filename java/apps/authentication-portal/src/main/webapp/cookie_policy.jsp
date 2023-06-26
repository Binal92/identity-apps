<%--
  ~ Copyright (c) 2018-2023, WSO2 LLC. (https://www.wso2.com).
  ~
  ~ WSO2 LLC. licenses this file to you under the Apache License,
  ~ Version 2.0 (the "License"); you may not use this file except
  ~ in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~    http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing,
  ~ software distributed under the License is distributed on an
  ~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  ~ KIND, either express or implied.  See the License for the
  ~ specific language governing permissions and limitations
  ~ under the License.
--%>

<%@ page import="java.io.File" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="layout" uri="org.wso2.identity.apps.taglibs.layout.controller" %>

<%-- Localization --%>
<%@ include file="includes/localize.jsp" %>

<%-- Include tenant context --%>
<%@include file="includes/init-url.jsp" %>

<%-- Branding Preferences --%>
<jsp:directive.include file="includes/branding-preferences.jsp"/>

<%-- Data for the layout from the page --%>
<%
    layoutData.put("isPolicyPage", true);
    layoutData.put("containerSize", "medium");
%>

<!doctype html>
<html lang="en-US">
<head>
    <%-- header --%>
    <%
        File headerFile = new File(getServletContext().getRealPath("extensions/header.jsp"));
        if (headerFile.exists()) {
    %>
        <jsp:include page="extensions/header.jsp"/>
    <% } else { %>
        <jsp:include page="includes/header.jsp"/>
    <% } %>
</head>
<body class="login-portal layout authentication-portal-layout policy-page-layout cookie-policy-page-layout">
    <layout:main layoutName="<%= layout %>" layoutFileRelativePath="<%= layoutFileRelativePath %>" data="<%= layoutData %>" >
        <layout:component componentName="ProductHeader">
            <%-- product-title --%>
            <%
            File productTitleFile = null;
            String productTitleFilePath;
            
            if (StringUtils.isNotBlank(customLayoutFileRelativeBasePath)) {
                productTitleFile = new File(getServletContext().getRealPath(customLayoutFileRelativeBasePath + "/product-footer.jsp"));
            }

            if (productTitleFile != null && productTitleFile.exists()) {
                productTitleFilePath = customLayoutFileRelativeBasePath + "/product-title.jsp";
            } else {
                productTitleFile = new File(getServletContext().getRealPath("extensions/product-title.jsp"));
                if (productTitleFile.exists()) {
                    productTitleFilePath = "extensions/product-title.jsp";
                } else {
                    productTitleFilePath = "includes/product-title.jsp";
                }
            }
            %>
            <jsp:include page="<%= productTitleFilePath %>" />
        </layout:component>
        <layout:component componentName="MainSection" >
            <%-- page content --%>
            <%
            File cookiePolicyFile = new File(getServletContext().getRealPath("extensions/cookie-policy-content.jsp"));
            if (cookiePolicyFile.exists()) {
            %>
                <jsp:include page="extensions/cookie-policy-content.jsp"/>
            <% } else { %>
                <jsp:include page="includes/cookie-policy-content.jsp"/>
            <% } %>
        </layout:component>
        <layout:component componentName="ProductFooter">
            <%-- product-footer --%>
            <%
            File productFooterFile = null;
            String productFooterFilePath;
            
            if (StringUtils.isNotBlank(customLayoutFileRelativeBasePath)) {
                productFooterFile = new File(getServletContext().getRealPath(customLayoutFileRelativeBasePath + "/product-footer.jsp"));
            }

            if (productFooterFile != null && productFooterFile.exists()) {
                productFooterFilePath = customLayoutFileRelativeBasePath + "/product-footer.jsp";
            } else {
                productFooterFile = new File(getServletContext().getRealPath("extensions/product-footer.jsp"));
                if (productFooterFile.exists()) {
                    productFooterFilePath = "extensions/product-footer.jsp";
                } else {
                    productFooterFilePath = "includes/product-footer.jsp";
                }
            }
            %>
            <jsp:include page="<%= productFooterFilePath %>" />
        </layout:component>
    </layout:main>

    <%-- footer --%>
    <%
        File footerFile = new File(getServletContext().getRealPath("extensions/footer.jsp"));
        if (footerFile.exists()) {
    %>
        <jsp:include page="extensions/footer.jsp"/>
    <% } else { %>
        <jsp:include page="includes/footer.jsp"/>
    <% } %>

    <script type="text/javascript" src="js/u2f-api.js"></script>
    <script type="text/javascript">
        var ToC = "<nav role='navigation' class='table-of-contents'>" + "<h4>On this page:</h4>" + "<ul class='ui list nav'>";
        var newLine, el, title, link;

        $("#cookiePolicy h2, #cookiePolicy h3").each(function() {
            el = $(this);
            title = el.text();
            link = "#" + el.attr("id");

            if (el.is("h3")){
                newLine = "<li class='sub'>" + "<a href='" + link + "'>" + title + "</a>" + "</li>";
            } else {
                newLine = "<li>" + "<a href='" + link + "'>" + title + "</a>" + "</li>";
            }

            ToC += newLine;
        });

        ToC += "</ul>" + "</nav>";

        $("#toc").append(ToC);
    </script>
</body>
</html>
