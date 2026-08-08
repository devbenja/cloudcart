<#-- Shell del tema CloudCart. Reemplaza el wrapper base (patrón y estructura
     de secciones idénticos a los del tema base, con look de CloudCart). -->
<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/logo.svg">
    <link href="${url.resourcesPath}/css/cloudcart.css" rel="stylesheet">
</head>
<body class="cc-body ${bodyClass!}">
    <div class="cc-accent-bar"></div>

    <main class="cc-main">
        <div class="cc-card">
            <div class="cc-logo">
                <img src="${url.resourcesPath}/img/logo.svg" alt="" class="cc-logo-img">
                <span class="cc-logo-text">Cloud<span>Cart</span></span>
            </div>

            <#-- Mensajes flash (error/success/info) -->
            <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="cc-alert cc-alert-${message.type}" role="alert">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <#-- Título de página, o reintento con nombre de usuario -->
            <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                <h1 class="cc-title"><#nested "header"></h1>
            <#else>
                <div class="cc-restart">
                    <#nested "show-username">
                </div>
            </#if>

            <div class="cc-content">
                <#nested "form">
            </div>

            <#if displayInfo>
                <div class="cc-info">
                    <#nested "info">
                </div>
            </#if>

            <#if social?? && social.providers?has_content>
                <div class="cc-divider"><span>o</span></div>
                <div class="cc-social">
                    <#nested "socialProviders">
                </div>
            </#if>
        </div>

        <div class="cc-footer">
            <#if realm.internationalizationEnabled && locale.supported?size gt 1>
                <div class="cc-locale">
                    <#list locale.supported as l>
                        <a href="${l.url}" class="${(l.languageTag == locale.currentLanguageTag)?then('cc-locale-active','')}">${l.label}</a>
                    </#list>
                </div>
            </#if>
            <a class="cc-footer-link" href="${properties.siteUrl!}">← Volver a CloudCart</a>
            <span class="cc-footer-copy">© CloudCart · Tienda demo</span>
        </div>
    </main>
</body>
</html>
</#macro>
