<%--
  ~ Copyright (c) 2020-2023, WSO2 LLC. (https://www.wso2.com).
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

<%@ page import="org.owasp.encoder.Encode" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.IdentityManagementEndpointUtil" %>
<%@ page import="org.wso2.carbon.identity.application.authentication.endpoint.util.Constants" %>
<%@ page import="java.io.File" %>
<%@ page import="java.util.Map" %>
<%@ page import="org.apache.commons.lang.StringUtils"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="static java.util.Base64.getDecoder" %>
<%@ page import="org.wso2.carbon.identity.authenticator.smsotp.SMSOTPConstants" %>
<%@ page import="org.apache.commons.lang.StringUtils" %>
<%@ page import="org.wso2.carbon.identity.application.authentication.endpoint.util.AuthenticationEndpointUtil" %>
<%@ taglib prefix="layout" uri="org.wso2.identity.apps.taglibs.layout.controller" %>

<%-- Localization --%>
<%@ include file="includes/localize.jsp" %>

<%-- Include tenant context --%>
<jsp:directive.include file="includes/init-url.jsp"/>

<%-- Branding Preferences --%>
<jsp:directive.include file="includes/branding-preferences.jsp"/>

<%
    request.getSession().invalidate();
    String queryString = request.getQueryString();
    Map<String, String> idpAuthenticatorMapping = null;
    String mobileRegex = null;
    boolean validateMobileNumberFormat = false;
    String mobileRegexPolicyValidationErrorMessage = null;
    if (request.getAttribute(Constants.IDP_AUTHENTICATOR_MAP) != null) {
        idpAuthenticatorMapping = (Map<String, String>) request.getAttribute(Constants.IDP_AUTHENTICATOR_MAP);
    }
    if (StringUtils.isNotBlank(request.getParameter(SMSOTPConstants.MOBILE_NUMBER_REGEX_PATTERN))) {
        mobileRegex = new String(getDecoder().decode(request.getParameter(SMSOTPConstants.MOBILE_NUMBER_REGEX_PATTERN)));
        validateMobileNumberFormat = true;
    }
    if (StringUtils.isNotBlank(request.getParameter(SMSOTPConstants.MOBILE_NUMBER_PATTERN_POLICY_FAILURE_ERROR_MESSAGE))) {
        mobileRegexPolicyValidationErrorMessage = new String(getDecoder().decode(request.getParameter(SMSOTPConstants.MOBILE_NUMBER_PATTERN_POLICY_FAILURE_ERROR_MESSAGE)));
    }

    String errorMessage = IdentityManagementEndpointUtil.i18n(resourceBundle,"error.retry");
    boolean authenticationFailed = false;

    if (Boolean.parseBoolean(request.getParameter(Constants.AUTH_FAILURE))) {
        authenticationFailed = true;

        if (request.getParameter(Constants.AUTH_FAILURE_MSG) != null) {
            errorMessage = request.getParameter(Constants.AUTH_FAILURE_MSG);

                if (errorMessage.equalsIgnoreCase("authentication.fail.message")) {
                    errorMessage = AuthenticationEndpointUtil.i18n(resourceBundle, "error.retry");
                }

                if (StringUtils.isNotBlank(request.getParameter("authFailureInfo"))) {
                    errorMessage = request.getParameter("authFailureInfo");
                }
        }
    }
%>

<%-- Data for the layout from the page --%>
<%
    layoutData.put("containerSize", "medium");
%>

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
        <!--[if lt IE 9]>
        <script src="js/html5shiv.min.js"></script>
        <script src="js/respond.min.js"></script>
        <![endif]-->
    </head>

    <body class="login-portal layout sms-otp-portal-layout" onload="getLoginDiv()">
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
                <div class="ui segment">
                    <%-- page content --%>
                    <h2><%=IdentityManagementEndpointUtil.i18n(resourceBundle, "enter.phone.number")%></h2>
                    <div class="ui divider hidden"></div>
                    <%
                        if (authenticationFailed) {
                    %>
                            <div class="ui negative message" id="failed-msg"><%=Encode.forHtmlContent(errorMessage)%></div>
                            <div class="ui divider hidden"></div>
                    <% } %>
                    <div id="error-msg"></div>
                    <div id="alertDiv"></div>
                    <div class="segment-form">
                        <form class="ui large form" id="pin_form" name="pin_form" action="../../commonauth"  method="POST">
                            <%
                                String loginFailed = request.getParameter("authFailure");
                                if (loginFailed != null && "true".equals(loginFailed)) {
                                    String authFailureMsg = request.getParameter("authFailureMsg");
                                    if (authFailureMsg != null && "login.fail.message".equals(authFailureMsg)) {
                            %>
                                        <div class="ui negative message"><%=IdentityManagementEndpointUtil.i18n(resourceBundle, "error.retry")%></div>
                                        <div class="ui divider hidden"></div>
                            <% } }  %>
                            <div class="field">
                                <label class="control-label" for="password"></label>
                                <input type="text" id='MOBILE_NUMBER' name="MOBILE_NUMBER"
                                        class="input-xlarge" size='30'/>
                            </div>
                            <input type="hidden" name="sessionDataKey"
                                    value='<%=Encode.forHtmlAttribute(request.getParameter("sessionDataKey"))%>'/>

                            <div class="align-right buttons">
                                <input type="button" name="update" id="update" value="<%=IdentityManagementEndpointUtil.i18n(resourceBundle, "update")%>"
                                        class="ui primary button"/>
                            </div>
                        </form>
                    </div>
                </div>
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

        <% String enterMobileNumberMessage = AuthenticationEndpointUtil.i18n(resourceBundle, "enter.mobile.number"); %>

        <script type="text/javascript">
            $(document).ready(function() {
                $('#update').click(function() {
                    var mobileNumber = document.getElementById("MOBILE_NUMBER").value;
                    if (mobileNumber == "") {
                        document.getElementById('alertDiv').innerHTML
                            = '<div id="error-msg" class="ui negative message"><%=enterMobileNumberMessage%></div>'
                              +'<div class="ui divider hidden"></div>';
                    } else if (<%=validateMobileNumberFormat%> && !(mobileNumber.match("<%=mobileRegex%>"))) {
                       document.getElementById('alertDiv').innerHTML
                          = '<div id="error-msg" class="ui negative message"><%=mobileRegexPolicyValidationErrorMessage%></div>'
                            +'<div class="ui divider hidden"></div>';
                    } else {
                        $('#pin_form').submit();
                    }
                });
            });
        </script>
    </body>
</html>
