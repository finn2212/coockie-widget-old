import clsx from "clsx";
import styles from "./style/style.scss";
import { localStorageGetItem, localStorageSetItem } from "./store/localStorage";
import { apiTransform } from "./transformer/apiTransform";
import cookieBehaviour from "./behaviour/cookieBehaviour";
import Client from "./client/client";

// config may be set in js by defining a global variable of gtCookieWidgetConfig
// this was done for the sake of the preview within GetTerms

export function createWidget(blacklists) {
  let gtCookieWidget;

  const trustedTypes = window.trustedTypes;

  let policy;
  if (trustedTypes) {
    policy = trustedTypes.createPolicy("getTerms", {
      createHTML: input => input,
    });
  }

  /**
   * If the customer has the "require-trusted-types-for 'script'" CSP header, we need to use the trustedTypes API
   * when we want to set innerHTML. Otherwise, we can just set innerHTML directly.
   */
  function setInnerHtml(element, html) {
    if (typeof policy === "undefined") {
      element.innerHTML = html;
    } else {
      const trustedHtml = policy.createHTML(html);
      element.innerHTML = trustedHtml;
    }
  }

  // We can set config overrides here via JS if we need to
  window.gtCookieWidgetConfig = window.gtCookieWidgetConfig || {};

  // We can reinitialise the widget from outside this JS context if we need to
  window.gtCookieWidgetPreview = () => {
    if (gtCookieWidget) {
      gtCookieWidget.reInitialise();
    } else {
      gtCookieWidget = new GetTermsCookieWrapper({}, {}, null, true, true);
    }
    setTimeout(() => {
      gtCookieWidget.showWidget();
    }, 10);
  };

  window.gtCookieWidget = config => {
    gtCookieWidget = new GetTermsCookieWrapper(
      apiTransform(config).userConfig,
      apiTransform(config).detectedCookies,
      config.uuid ? new Client(config.api_base, config.uuid) : null
    );

    // If we allow preference management, add an event listener for any button with given data attibribute to re-open the cookie modal
    if (gtCookieWidget.config.functionality.allowPreferences === "on") {
      document.addEventListener("click", e => {
        const triggerElement = e.target.closest("[data-gt-cookie-widget-show]");

        if (triggerElement) {
          gtCookieWidget.showDialog();
        }
      });
    }
  };

  class GetTermsCookieWrapper {
    constructor(config, detectedCookies, client, injectImmediately = false, isPreview = false) {
      this.cookieSVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.491 7.49558C17.0792 7.49581 16.6716 7.4146 16.2914 7.25662C15.9112 7.09864 15.5661 6.86702 15.2757 6.57509C14.9854 6.28316 14.7557 5.9367 14.5999 5.55563C14.4441 5.17457 14.3652 4.76644 14.3677 4.35475C13.8292 4.7683 13.1699 4.99346 12.491 4.99558C11.9737 4.99601 11.4643 4.8679 11.0088 4.62276C10.5532 4.37763 10.1657 4.02316 9.88107 3.59118C9.59641 3.15921 9.42357 2.66329 9.37799 2.14798C9.33249 1.63266 9.41566 1.11411 9.62016 0.638916C7.66194 0.71841 5.77801 1.41024 4.23374 2.61696C2.68948 3.82366 1.56271 5.48445 1.01214 7.36535C0.461578 9.24628 0.514974 11.2524 1.16481 13.1014C1.81464 14.9504 3.02816 16.5489 4.63443 17.6718C6.2407 18.7946 8.15876 19.3853 10.1184 19.3604C12.0781 19.3357 13.9806 18.6967 15.558 17.5336C17.1353 16.3704 18.3081 14.7418 18.9109 12.877C19.5137 11.0122 19.5164 9.00528 18.9185 7.13891C18.4783 7.37101 17.9886 7.49337 17.491 7.49558Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.22754 10.6157C7.26307 10.6157 8.10254 9.7763 8.10254 8.74071C8.10254 7.70519 7.26307 6.86572 6.22754 6.86572C5.19201 6.86572 4.35254 7.70519 4.35254 8.74071C4.35254 9.7763 5.19201 10.6157 6.22754 10.6157Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.8525 15.6157C12.5428 15.6157 13.1025 15.0561 13.1025 14.3657C13.1025 13.6754 12.5428 13.1157 11.8525 13.1157C11.1621 13.1157 10.6025 13.6754 10.6025 14.3657C10.6025 15.0561 11.1621 15.6157 11.8525 15.6157Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.91663 14.3657C5.74403 14.3657 5.60413 14.2258 5.60413 14.0532C5.60413 13.8806 5.74403 13.7407 5.91663 13.7407" stroke="currentColor"/><path d="M5.91663 14.3657C6.08921 14.3657 6.22913 14.2258 6.22913 14.0532C6.22913 13.8806 6.08921 13.7407 5.91663 13.7407" stroke="currentColor"/><path d="M10.9151 8.74071C10.7425 8.74071 10.6026 8.6008 10.6026 8.42821C10.6026 8.25564 10.7425 8.11572 10.9151 8.11572" stroke="currentColor"/><path d="M10.9151 8.74071C11.0878 8.74071 11.2276 8.6008 11.2276 8.42821C11.2276 8.25564 11.0878 8.11572 10.9151 8.11572" stroke="currentColor"/><path d="M15.9152 11.241C15.7426 11.241 15.6027 11.1011 15.6027 10.9285C15.6027 10.7559 15.7426 10.616 15.9152 10.616" stroke="currentColor"/><path d="M15.9152 11.241C16.0877 11.241 16.2277 11.1011 16.2277 10.9285C16.2277 10.7559 16.0877 10.616 15.9152 10.616" stroke="currentColor"/></svg>`;

      this.cogSVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.03067 1.62536C7.15301 1.76116 7.30252 1.86974 7.4695 1.94406C7.63649 2.01838 7.81723 2.05678 8.00001 2.05678C8.18279 2.05678 8.36352 2.01838 8.53051 1.94406C8.6975 1.86974 8.847 1.76116 8.96934 1.62536L9.60001 0.933357C9.78076 0.733317 10.019 0.594118 10.282 0.534864C10.545 0.475609 10.8199 0.499204 11.069 0.60241C11.318 0.705616 11.5291 0.883374 11.6731 1.11129C11.8171 1.3392 11.8871 1.6061 11.8733 1.87536L11.826 2.80869C11.8169 2.99076 11.8459 3.17273 11.9114 3.34288C11.9768 3.51303 12.0772 3.66758 12.206 3.79658C12.3348 3.92558 12.4892 4.02617 12.6593 4.09186C12.8293 4.15756 13.0113 4.18691 13.1933 4.17802L14.1267 4.13069C14.3958 4.11742 14.6624 4.1877 14.8899 4.33188C15.1175 4.47607 15.2949 4.6871 15.3979 4.93607C15.5008 5.18503 15.5243 5.45974 15.465 5.72254C15.4057 5.98535 15.2665 6.22338 15.0667 6.40402L14.372 7.03069C14.2364 7.1532 14.128 7.3028 14.0537 7.46983C13.9795 7.63685 13.9412 7.81759 13.9412 8.00036C13.9412 8.18312 13.9795 8.36386 14.0537 8.53089C14.128 8.69791 14.2364 8.84751 14.372 8.97002L15.0667 9.59669C15.2667 9.77744 15.4059 10.0157 15.4652 10.2787C15.5244 10.5417 15.5008 10.8166 15.3976 11.0657C15.2944 11.3147 15.1167 11.5257 14.8887 11.6698C14.6608 11.8138 14.3939 11.8837 14.1247 11.87L13.1913 11.8227C13.0089 11.8133 12.8265 11.8423 12.6559 11.9079C12.4854 11.9735 12.3305 12.0741 12.2013 12.2033C12.0721 12.3325 11.9714 12.4874 11.9059 12.6579C11.8403 12.8285 11.8113 13.0109 11.8207 13.1934L11.868 14.1267C11.8799 14.3946 11.8091 14.6597 11.6652 14.8859C11.5212 15.1122 11.3111 15.2886 11.0633 15.3913C10.8156 15.494 10.5423 15.5179 10.2805 15.4598C10.0187 15.4017 9.78109 15.2645 9.60001 15.0667L8.97267 14.3727C8.85022 14.2371 8.70068 14.1287 8.53371 14.0545C8.36674 13.9803 8.18606 13.9419 8.00334 13.9419C7.82062 13.9419 7.63994 13.9803 7.47297 14.0545C7.306 14.1287 7.15646 14.2371 7.03401 14.3727L6.40401 15.0667C6.22321 15.2654 5.98554 15.4035 5.72337 15.4623C5.46121 15.521 5.18732 15.4974 4.93904 15.3948C4.69076 15.2921 4.48017 15.1154 4.33599 14.8887C4.1918 14.662 4.12104 14.3964 4.13334 14.128L4.18134 13.1947C4.19073 13.0122 4.1617 12.8298 4.09614 12.6593C4.03058 12.4887 3.92994 12.3338 3.80074 12.2046C3.67154 12.0754 3.51666 11.9748 3.34611 11.9092C3.17556 11.8437 2.99315 11.8146 2.81067 11.824L1.87734 11.8714C1.6082 11.8854 1.3413 11.8158 1.1133 11.6721C0.885296 11.5284 0.707363 11.3176 0.603929 11.0688C0.500494 10.8199 0.476629 10.5451 0.535609 10.2821C0.59459 10.0192 0.733525 9.78088 0.93334 9.60002L1.62734 8.97336C1.76297 8.85085 1.87139 8.70125 1.9456 8.53422C2.01981 8.36719 2.05815 8.18646 2.05815 8.00369C2.05815 7.82092 2.01981 7.64019 1.9456 7.47316C1.87139 7.30613 1.76297 7.15653 1.62734 7.03402L0.93334 6.40402C0.734173 6.22336 0.595662 5.98559 0.536741 5.72322C0.47782 5.46086 0.501364 5.1867 0.604155 4.93822C0.706946 4.68974 0.883968 4.47907 1.11102 4.33501C1.33807 4.19094 1.60408 4.12052 1.87267 4.13336L2.80601 4.18069C2.98883 4.1903 3.17162 4.16135 3.34252 4.09572C3.51343 4.03008 3.66861 3.92923 3.798 3.79972C3.92739 3.6702 4.02809 3.51492 4.09355 3.34396C4.15902 3.17299 4.1878 2.99017 4.17801 2.80736L4.13334 1.87336C4.12074 1.60487 4.1913 1.33903 4.33537 1.11212C4.47944 0.885206 4.69002 0.708275 4.93837 0.605465C5.18671 0.502656 5.46073 0.478977 5.72303 0.537658C5.98534 0.59634 6.22314 0.734525 6.40401 0.933357L7.03067 1.62536Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /><path d="M5 8.00061C5 8.79626 5.31607 9.55932 5.87868 10.1219C6.44129 10.6845 7.20435 11.0006 8 11.0006C8.79565 11.0006 9.55871 10.6845 10.1213 10.1219C10.6839 9.55932 11 8.79626 11 8.00061C11 7.20496 10.6839 6.4419 10.1213 5.87929C9.55871 5.31668 8.79565 5.00061 8 5.00061C7.20435 5.00061 6.44129 5.31668 5.87868 5.87929C5.31607 6.4419 5 7.20496 5 8.00061Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

      // Set in initialise()
      this.config = {};
      this.detectedCookies = {};
      this.isPreview = isPreview;

      // Set in injectTheme()
      this.themeStyleElement = null;

      // Set in injectStyles()
      this.stylesStyleElement = null;

      // Set in injectWidget()
      this.wrapperElement = null;
      this.widgetElement = null;
      this.dialogElement = null;
      this.checkboxElements = [];

      // Set in show/hideDialog/Widget
      this.isWidgetShown = false;
      this.isDialogShown = false;

      // Set when showDialog() is called, and cleared when hideDialog() is called
      this.currentTriggerElement = null;

      this.initialise(config, detectedCookies, client, injectImmediately);
    }

    initialise(config, detectedCookies, client, injectImmediately) {
      // Preview
      if (window.gtCookieWidgetConfig && window.gtCookieWidgetConfig.config) {
        this.config = apiTransform(window.gtCookieWidgetConfig).userConfig;
        this.detectedCookies = apiTransform(window.gtCookieWidgetConfig).detectedCookies;
      } else {
        // Production
        this.config = config;
        this.detectedCookies = detectedCookies;
      }

      if (window.location.search.includes("gt-cookie-noblock")) {
        this.config.functionality.blockInteraction = "off";
      }

      this.client = client;

      this.initScriptBlocker();
      this.initGoogleConsent();

      if (localStorageGetItem("cookie_preferences")) {
        this.initializeCookieBehavior();
      }

      const _this = this;
      function inject() {
        _this.injectStyles();
        _this.injectTheme();
        _this.injectWidget();
        _this.correctFontFamily();
        _this.initEventHandlers();

        if (!localStorageGetItem("cookie_preferences")) {
          setTimeout(() => {
            _this.showWidget();
          }, 10);
        }
      }

      if (injectImmediately || document.readyState !== "loading") {
        inject();
      } else {
        document.addEventListener("DOMContentLoaded", inject);
      }
    }

    initScriptBlocker() {
      if (this.config.functionality.blockScripts === "on") {
        const { unblock } = require("yett");
        this.unblockScripts = unblock;
      }
    }

    /**
     * If Google Consent Mode is enabled, we need to unblock GTM and retain whatever consent the user has already given
     */
    initGoogleConsent() {
      if (this.config.functionality.googleConsentMode === "on") {
        /**
         *   Called from GTM template to set callback to be executed when user consent is provided.
         *   @param {function} Callback to execute on user consent
         */
        window.gtCookieWidgetAddGtmCallback = callback => {
          this.gtmCallback = callback;
        };

        /**
         * If we've initialised script blocking, immediately unblock GTM
         */
        this.unblockScripts && this.unblockScripts("googletagmanager.com");

        /** If the user has already set their preferences before, retain them for Google Consent here */
        const preferences = localStorageGetItem("cookie_preferences");
        if (preferences) {
          this.updatePreferences(preferences, true, true);
        }
      }
    }

    /**
     * Set up theme CSS variables in a `<style>` tag and append to head
     */
    injectTheme() {
      this.themeStyleElement = document.createElement("style");
      setInnerHtml(
        this.themeStyleElement,
        `:root {
									--gt-cookie-font-size: ${this.config.theme.fontSize};
									--gt-cookie-bg: ${this.config.theme.background};
									--gt-cookie-text: ${this.config.theme.text};
									--gt-cookie-link-text: ${this.config.theme.linkText};
									--gt-cookie-button-bg: ${this.config.theme.buttonBackground};
									--gt-cookie-button-text: ${this.config.theme.buttonText};
								}`
      );
      document.head.appendChild(this.themeStyleElement);
    }

    /**
     * Set up stylesheet <style> and append to head
     */
    injectStyles() {
      this.stylesStyleElement = document.createElement("style");
      this.stylesStyleElement.setAttribute("type", "text/css");
      setInnerHtml(this.stylesStyleElement, styles);
      document.head.appendChild(this.stylesStyleElement);
    }

    /**
     * Set up the wrapper <div> and append to body
     */
    injectWidget() {
      this.wrapperElement = document.createElement("div");
      this.wrapperElement.classList.add("gt-cookie-widget-wrapper");
      this.wrapperElement.classList.toggle(
        "gt-cookie-widget-wrapper--block",
        this.config.functionality.blockInteraction === "on"
      );
      const preferences = localStorageGetItem("cookie_preferences");

      const layoutClasses = clsx(
        "gt-cookie-widget--" + this.config.layout.position,
        "gt-cookie-widget--" + this.config.layout.appearance
      );

      const languageMap = {
        ["essential-cookies"]: {
          title: this.config.content.cookieEssentialTitle,
          description: this.config.content.cookieEssentialDescription,
        },
        functional: {
          title: this.config.content.cookieFunctionalTitle,
          description: this.config.content.cookieFunctionalDescription,
        },
        marketing: {
          title: this.config.content.cookieMarketingTitle,
          description: this.config.content.cookieMarketingDescription,
        },
        analytics: {
          title: this.config.content.cookieAnalyticsTitle,
          description: this.config.content.cookieAnalyticsDescription,
        },
        unclassified: {
          title: this.config.content.cookieUnclassifiedTitle,
          description: this.config.content.cookieUnclassifiedDescription,
        },
      };

      const cookiePolicyUrl = new URL(this.config.content.cookiePolicyUrl);

      if (this.config.functionality.blockInteraction === "on") {
        cookiePolicyUrl.searchParams.set("gt-cookie-noblock", "");
      }

      const widgetButtonStrokeIfPill =
        this.config.layout.appearance === "pill" ? "gt-cookie-widget__button--stroke" : "";

      const bannerMessageWithParsedLinks = this.config.content.widgetBannerMessage.replaceAll(
        "[cookiepolicy]",
        `<a href="${cookiePolicyUrl}">${this.config.content.cookiePolicyLinkText ||
          "Cookie Policy"}</a>`
      );
      const dialogMessageWithParsedLinks = this.config.content.dialogMessage.replaceAll(
        "[cookiepolicy]",
        `<a href="${cookiePolicyUrl}">${this.config.content.cookiePolicyLinkText ||
          "Cookie Policy"}</a>`
      );

      setInnerHtml(
        this.wrapperElement,
        /* HTML */ `
          <div class="gt-cookie-widget ${layoutClasses}">
            ${this.config.functionality.blockInteraction === "on"
              ? `<span tabindex="0" data-gt-cookie-tab-trap-top="widget"></span>`
              : ""}
            ${this.config.layout.appearance === "pill"
              ? /* HTML */ `
                  <i class="gt-cookie-widget__icon">${this.cookieSVG}</i>
                  <span class="gt-cookie-widget__content"
                    >${this.config.content.widgetPillMessage}</span
                  >
                `
              : `<p class="gt-cookie-widget__content">${bannerMessageWithParsedLinks}</p>`}
            <div class="gt-cookie-widget__actions">
              ${this.config.functionality.hasRejectAll === "on" &&
              this.config.functionality.allowPreferences === "on"
                ? `<button class="gt-cookie-widget__icon-button" data-gt-cookie-dialog-open aria-label="Open Cookie Preferences">${this.cogSVG}</button>`
                : ""}
              ${this.config.functionality.hasRejectAll === "off" &&
              this.config.functionality.allowPreferences === "on"
                ? /* HTML */ `
                    <button
                      class="gt-cookie-widget__button gt-cookie-widget__button--naked ${widgetButtonStrokeIfPill}"
                      data-gt-cookie-dialog-open
                    >
                      ${this.config.content.widgetManagePreferencesButton}
                    </button>
                  `
                : ""}
              ${this.config.functionality.hasRejectAll === "on"
                ? /* HTML */ `
                    <button
                      class="gt-cookie-widget__button gt-cookie-widget__button--naked ${widgetButtonStrokeIfPill}"
                      data-gt-cookie-reject-all
                    >
                      ${this.config.content.widgetRejectAllButton}
                    </button>
                  `
                : ""}
              <button class="gt-cookie-widget__button" data-gt-cookie-accept-all>
                ${this.config.content.widgetAcceptAllButton}
              </button>
            </div>
            ${this.config.functionality.blockInteraction === "on"
              ? `<span tabindex="0" data-gt-cookie-tab-trap-bottom="widget"></span>`
              : ""}
          </div>

          ${this.config.functionality.allowPreferences === "on"
            ? /* HTML */ `
                <div
                  class="gt-cookie-dialog"
                  id="gt-cookie-dialog"
                  role="dialog"
                  aria-role="modal"
                  style="display: none;"
                  aria-labelledby="gt-cookie-dialog-heading"
                >
                  <span tabindex="0" data-gt-cookie-tab-trap-top="dialog"></span>
                  <div class="gt-cookie-dialog__modal">
                    <button
                      class="gt-cookie-dialog__close"
                      data-gt-cookie-dialog-close
                      aria-label="Close Cookie Preferences Dialog"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.24265 0.778076L9.72793 9.26336"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                        <path
                          d="M1.24265 9.26343L9.72793 0.778146"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                    <h2 class="gt-cookie-dialog__heading" id="gt-cookie-dialog-heading">
                      ${this.config.content.dialogTitle}
                    </h2>
                    <p class="gt-cookie-dialog__content">
                      ${dialogMessageWithParsedLinks}
                    </p>

                    <form class="gt-cookie-dialog__form" data-gt-cookie-form>
                      ${Object.entries(this.detectedCookies)
                        .map(
                          ([label, data], index) => /* HTML */ `
                            <div
                              class="gt-cookie-dialog__checkbox-wrapper ${index === 0
                                ? "gt-cookie-dialog__checkbox-wrapper--disabled"
                                : ""}"
                            >
                              <label class="gt-cookie-dialog__checkbox">
                                <input
                                  type="checkbox"
                                  name="${data.slug}"
                                  ${index === 0 ? "disabled" : ""}
                                  class="gt-cookie-dialog__checkbox-input"
                                  tabindex="-1"
                                  aria-hidden="true"
                                  data-gt-cookie-checkbox-input="${data.slug}"
                                  ${(preferences && preferences[label]) || index === 0
                                    ? "checked"
                                    : ""}
                                />
                                <div
                                  class="gt-cookie-dialog__checkbox-display"
                                  role="checkbox"
                                  tabindex="${index === 0 ? "-1" : "0"}"
                                  data-gt-cookie-checkbox-display="${data.slug}"
                                  aria-checked="${(preferences && preferences[label]) || index === 0
                                    ? "true"
                                    : "false"}"
                                  aria-describedby="description-${data.slug}"
                                >
                                  <svg
                                    width="8"
                                    height="6"
                                    viewBox="0 0 8 6"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M7 1L3.10992 4.89008C3.05705 4.94302 2.9943 4.98504 2.92515 5.01377C2.85607 5.04243 2.78192 5.05718 2.70714 5.05718C2.63228 5.05718 2.55821 5.04243 2.4891 5.01377C2.41998 4.98504 2.3572 4.94302 2.30435 4.89008L1 3.58504"
                                      stroke="currentColor"
                                      stroke-width="1.5"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </svg>
                                </div>
                                <span class="gt-cookie-dialog__checkbox-label">
                                  ${languageMap[data.slug].title}
                                  <span class="gt-cookie-dialog__checkbox-total"
                                    >(${data.total})</span
                                  ></span
                                >
                              </label>
                              ${data.cookies && data.cookies.length > 0
                                ? /* HTML */ `
                                    <button
                                      type="button"
                                      class="gt-cookie-dialog__table-toggle"
                                      data-gt-cookie-toggle-target="table-${data.slug}"
                                      data-gt-cookie-toggle-target-toggled="false"
                                    >
                                      <span>
                                        ${this.config.content.widgetShowCookiesButton || "Show"}
                                      </span>
                                      <span>
                                        ${this.config.content.widgetHideCookiesButton || "Hide"}
                                      </span>
                                    </button>
                                  `
                                : ""}
                              <span
                                class="gt-cookie-dialog__checkbox-description"
                                id="description-${data.slug}"
                                >${languageMap[data.slug].description}</span
                              >
                              ${/*
                               * Cookies table for all except unclassified
                               */
                              data.slug !== "unclassified" &&
                              data.cookies &&
                              data.cookies.length > 0
                                ? /* HTML */ `
                                    <table
                                      class="gt-cookie-dialog__table gt-cookie-hide"
                                      id="table-${data.slug}"
                                    >
                                      <thead>
                                        <tr>
                                          <th align="left">
                                            ${this.config.content.cookieHeadingPlatform ||
                                              "Platform"}
                                          </th>
                                          <th align="left">
                                            ${this.config.content.cookieHeadingNameDescription ||
                                              "Name & Description"}
                                          </th>
                                          <th align="right">
                                            ${this.config.content.cookieHeadingRetention ||
                                              "Retention"}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${data.cookies
                                          .map(
                                            cookie => /* HTML */ `
                                              <tr>
                                                <td align="left">
                                                  ${
                                                    cookie.data_controller
                                                      ? cookie.user_privacy_gdpr_rights_portals
                                                        ? `<a href="${cookie.user_privacy_gdpr_rights_portals}" target="_blank">${cookie.data_controller}</a>`
                                                        : cookie.data_controller
                                                      : ""
                                                  }
                                                </td>
                                                <td align="left">
                                                  <strong>${cookie.key || ""}</strong>
                                                  <span>${cookie.description || ""}<span>
																								</td>
                                                <td align="right">
                                                  ${cookie.retention_period || ""}
                                                </td>
                                              </tr>
                                            `
                                          )
                                          .join("")}
                                      </tbody>

                                      <tbody></tbody>
                                    </table>
                                  `
                                : /*
                                 * Cookies table for unclassified
                                 */
                                data.slug === "unclassified" &&
                                  data.cookies &&
                                  data.cookies.length > 0
                                ? /* HTML */ `
                                    <table
                                      class="gt-cookie-dialog__table gt-cookie-hide"
                                      id="table-${data.slug}"
                                    >
                                      <thead>
                                        <tr>
                                          <th align="left">
                                            Name
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${data.cookies
                                          .map(
                                            cookie => /* HTML */ `
                                              <tr>
                                                <td align="left">
                                                  ${cookie.key || ""}
                                                </td>
                                              </tr>
                                            `
                                          )
                                          .join("")}
                                      </tbody>

                                      <tbody></tbody>
                                    </table>
                                  `
                                : ""}
                            </div>
                          `
                        )
                        .join("")}

                      <div class="gt-cookie-dialog__footer">
                        <button
                          type="button"
                          class="gt-cookie-dialog__button gt-cookie-dialog__button--stroke"
                          data-gt-cookie-save
                        >
                          ${this.config.content.dialogSavePreferencesButton}
                        </button>
                        ${this.config.functionality.hasRejectAll === "on"
                          ? `<button type="button" class="gt-cookie-dialog__button gt-cookie-dialog__button--stroke" data-gt-cookie-reject-all>${this.config.content.dialogRejectAllButton}</button>`
                          : ""}
                        <button
                          type="button"
                          class="gt-cookie-dialog__button"
                          data-gt-cookie-accept-all
                        >
                          ${this.config.content.dialogAcceptAllButton}
                        </button>
                      </div>
                    </form>
                  </div>
                  <span tabindex="0" data-gt-cookie-tab-trap-bottom="dialog"></span>
                </div>
              `
            : ""}
        `
      );

      this.widgetElement = this.wrapperElement.querySelector(".gt-cookie-widget");

      const tabbables = "a,button,textarea,input,select";

      this.widgetTabbables = this.widgetElement.querySelectorAll(tabbables);
      this.widgetTabTrapTop = this.widgetElement.querySelector(
        "[data-gt-cookie-tab-trap-top='widget']"
      );
      this.widgetTabTrapBottom = this.widgetElement.querySelector(
        "[data-gt-cookie-tab-trap-bottom='widget']"
      );

      if (this.config.functionality.allowPreferences === "on") {
        this.dialogElement = this.wrapperElement.querySelector(".gt-cookie-dialog");
        this.checkboxElements = this.dialogElement.querySelectorAll(
          "[data-gt-cookie-checkbox-input]"
        );

        this.dialogTabbables = this.dialogElement.querySelectorAll(tabbables);
        this.dialogTabTrapTop = this.dialogElement.querySelector(
          "[data-gt-cookie-tab-trap-top='dialog']"
        );
        this.dialogTabTrapBottom = this.dialogElement.querySelector(
          "[data-gt-cookie-tab-trap-bottom='dialog']"
        );
      }

      document.body.appendChild(this.wrapperElement);
    }

    /**
     * Detect whether the font family is being set by the client site, or if it's the user agent default.
     * If it's the user agent default, also set a "sans-serif" style attribute to prevent ugly defaults.
     */
    correctFontFamily() {
      const originalFontFamily = window.getComputedStyle(this.wrapperElement).fontFamily;
      this.wrapperElement.style.setProperty("font-family", "initial");
      const defaultFontFamily = window.getComputedStyle(this.wrapperElement).fontFamily;

      if (originalFontFamily === defaultFontFamily) {
        this.wrapperElement.style.setProperty("font-family", "sans-serif");
      } else {
        this.wrapperElement.style.removeProperty("font-family");
      }
    }

    /**
     * Set up all event handlers, under the assumption that all dom is already there.
     */
    initEventHandlers() {
      // Instead of the cancel event auto-closing the dialog, run our hideDialog() function instead to close it nicely
      this.config.functionality.allowPreferences === "on" &&
        this.dialogElement.addEventListener("cancel", e => {
          e.preventDefault();
          this.hideDialog();
        });

      const acceptAllButtons = this.wrapperElement.querySelectorAll("[data-gt-cookie-accept-all]");
      acceptAllButtons.forEach(el => el.addEventListener("click", e => this.acceptAllAndDismiss()));

      const rejectAllButtons = this.wrapperElement.querySelectorAll("[data-gt-cookie-reject-all]");
      rejectAllButtons.forEach(el => el.addEventListener("click", e => this.rejectAllAndDismiss()));

      const saveButtons = this.wrapperElement.querySelectorAll("[data-gt-cookie-save]");
      saveButtons.forEach(el =>
        el.addEventListener("click", e => this.savePreferencesAndDismiss(e))
      );

      const showDialogButtons = this.wrapperElement.querySelectorAll(
        "[data-gt-cookie-dialog-open]"
      );
      showDialogButtons.forEach(el => el.addEventListener("click", e => this.showDialog(e)));

      const closeDialogButtons = this.wrapperElement.querySelectorAll(
        "[data-gt-cookie-dialog-close]"
      );
      closeDialogButtons.forEach(el => el.addEventListener("click", e => this.hideDialog()));

      if (this.config.functionality.blockInteraction === "on") {
        this.widgetTabTrapTop.addEventListener("focus", () => {
          this.widgetTabbables.item(this.widgetTabbables.length - 1).focus();
        });
        this.widgetTabTrapBottom.addEventListener("focus", () => {
          this.widgetTabbables.item(0).focus();
        });
        if (this.config.functionality.allowPreferences === "on") {
          this.dialogTabTrapTop.addEventListener("focus", () => {
            this.dialogTabbables.item(this.dialogTabbables.length - 1).focus();
          });
          this.dialogTabTrapBottom.addEventListener("focus", () => {
            this.dialogTabbables.item(0).focus();
          });
        }
      }

      if (this.config.functionality.allowPreferences === "on") {
        const checkboxDisplays = this.wrapperElement.querySelectorAll(
          "[data-gt-cookie-checkbox-display]"
        );
        checkboxDisplays.forEach(el =>
          el.addEventListener("keydown", e => {
            // On Space/Enter
            if (e.key === " " || e.key === "Enter") {
              const input = this.dialogElement.querySelector(
                `[data-gt-cookie-checkbox-input=${el.dataset.gtCookieCheckboxDisplay}]`
              );
              input.checked = !input.checked;
              el.setAttribute("aria-checked", input.checked);
            }
          })
        );

        document.addEventListener("keydown", e => {
          if (e.key === "Escape" && this.dialogElement.dataset.gtCookieDialogShown === "true") {
            this.hideDialog();
          }
        });

        const cookieToggleButtons = this.wrapperElement.querySelectorAll(
          "[data-gt-cookie-toggle-target]"
        );
        cookieToggleButtons.forEach(el => {
          el.addEventListener("click", e => {
            const toToggle = this.dialogElement.querySelector(
              "#" + el.dataset.gtCookieToggleTarget
            );
            if (toToggle) {
              el.dataset.gtCookieToggleTargetToggled =
                el.dataset.gtCookieToggleTargetToggled === "true" ? "false" : "true";
              toToggle.classList.toggle(
                "gt-cookie-hide",
                el.dataset.gtCookieToggleTargetToggled === "false"
              );
            }
          });
        });
      }
    }

    showWidget() {
      if (!this.isWidgetShown) {
        this.isWidgetShown = true;
        this.wrapperElement.dataset.gtCookieWidgetShown = "true";

        if (this.config.functionality.blockInteraction === "on") {
          document.documentElement.classList.add("gt-cookie-noscroll");
          document.body.classList.add("gt-cookie-noscroll");
          this.widgetTabbables.item(0).focus();
        }
      }
    }

    hideWidget() {
      if (this.isWidgetShown) {
        this.isWidgetShown = false;
        // This will trigger a CSS animation
        this.wrapperElement.dataset.gtCookieWidgetShown = "false";

        this.widgetElement.addEventListener(
          "animationend",
          () => {
            delete this.wrapperElement.dataset.gtCookieWidgetShown;
          },
          {
            once: true,
          }
        );

        if (this.config.functionality.blockInteraction === "on") {
          document.documentElement.classList.remove("gt-cookie-noscroll");
          document.body.classList.remove("gt-cookie-noscroll");
        }
      }
    }

    showDialog(e) {
      if (this.dialogElement && !this.isDialogShown) {
        this.isDialogShown = true;
        // Keep track of the triggering element, so we can return focus there when we close the dialog
        this.currentTriggerElement = e ? e.target : null;

        this.dialogElement.removeAttribute("style");
        this.dialogElement.setAttribute("aria-hidden", "false");
        this.wrapperElement.dataset.gtCookieDialogShown = "true";
        document.documentElement.classList.add("gt-cookie-noscroll");
        document.body.classList.add("gt-cookie-noscroll");
        this.dialogTabbables.item(0).focus();
      }
    }

    hideDialog() {
      if (this.dialogElement && this.isDialogShown) {
        this.isDialogShown = false;
        // Return focus to the original triggering element.
        this.currentTriggerElement && this.currentTriggerElement.focus();
        this.currentTriggerElement = null;

        document.documentElement.classList.remove("gt-cookie-noscroll");
        document.body.classList.remove("gt-cookie-noscroll");
        // This will trigger a CSS animation
        this.wrapperElement.dataset.gtCookieDialogShown = "false";
        this.dialogElement.setAttribute("aria-hidden", "true");

        this.dialogElement.addEventListener(
          "animationend",
          () => {
            delete this.wrapperElement.dataset.gtCookieDialogShown;
          },
          {
            once: true,
          }
        );
      }
    }

    initializeCookieBehavior() {
      const preferences = localStorageGetItem("cookie_preferences");
      const block = [];

      Object.entries(this.detectedCookies).forEach(([categoryName, category]) => {
        if (preferences[categoryName] === false) {
          category.keys = category.keys || [];
          category.keys.forEach(key => {
            block.push(key);
          });
        }
      });

      cookieBehaviour({
        blockList: block,
      });
    }

    dismiss() {
      this.hideDialog();
      this.hideWidget();

      this.initializeCookieBehavior();
    }

    updatePreferences(prefs, suppressLog = false, suppressReload = false) {
      /** Save prefs to localStorage */
      localStorageSetItem("cookie_preferences", prefs);

      /** If there is no UUID create one */
      if (!localStorageGetItem("user_id")) {
        localStorageSetItem("user_id", this.generateUUID());
      }

      /** We once unblocked all consented categories in this space, but that was too slow, so now we rely on a window reload instead */

      /** Update GTM Google Consent prefs */
      if (this.config.functionality.googleConsentMode === "on") {
        // Send a GTM custom event for any triggers
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "consentUpdate",
        });

        // If we have a callback set, our GetTerms GTM Tag Template is being used and has initialised, so use that to update the consent
        if (this.gtmCallback) {
          this.gtmCallback(prefs);
        } else if (window.gtag) {
          window.gtag("consent", "update", {
            // This code is also mirrored in our GetTerms GTM Tag Template - any updates here **must** be reflected there too
            ad_storage: prefs["Marketing"] ? "granted" : "denied",
            ad_user_data: prefs["Marketing"] ? "granted" : "denied",
            ad_personalization: prefs["Marketing"] ? "granted" : "denied",
            analytics_storage: prefs["Analytics"] ? "granted" : "denied",
            functionality_storage: prefs["Functional"] ? "granted" : "denied",
            personalization_storage: prefs["Functional"] ? "granted" : "denied",
            security_storage: prefs["Essential Cookies"] ? "granted" : "denied",
          });
        } else {
          // If this code is reached, we've been unable to notify GTM of the user's consent.
          // This is likely because GTM has not loaded in time to be notified.
          if (!suppressLog) {
            console.warn(
              "Cookie preferences have been updated, but GTM has not loaded in time to be notified. Please ensure the following:\r\n",
              "\t1. You have added your GTM embed code to your page beneath the GetTerms cookie widget embed code.\r\n",
              "\t2. If you are not using the GetTerms GTM Tag Template, you have copied the code from the widget installation instructions correctly.\r\n",
              "\t3. If you are using the GetTerms GTM Tag Template, you have added the GetTerms GTM Tag Template to your GTM container and published the container.\r\n",
              "If all three above are true, GTM is likely to receive this consent update soon, and you can safely ignore this message."
            );
          }
        }
      }

      if (this.client) {
        this.client
          .storeLog({
            cookie_preferences: {
              Essential: prefs["Essential Cookies"],
              Functional: prefs["Functional"],
              Marketing: prefs["Marketing"],
              Analytics: prefs["Analytics"],
              Unclassified: prefs["Unclassified"],
            },
            user_id: localStorageGetItem("user_id"),
          })
          .then(response => {
            localStorageSetItem("user_id", response);
          })
          .catch(() => console.log("Unable to store logs at this time"))
          .finally(() => {
            // Reload here - we were using YETT's unblock() function, but that ran slow on very large lists like ours (mid-10 seconds)
            if (
              !suppressReload &&
              !this.isPreview &&
              this.config.functionality.blockScripts === "on"
            ) {
              window.location.reload();
            }
          });
      } else {
        // Reload here - we were using YETT's unblock() function, but that ran slow on very large lists like ours (mid-10 seconds)
        if (!suppressReload && !this.isPreview && this.config.functionality.blockScripts === "on") {
          window.location.reload();
        }
      }
    }

    savePreferencesAndDismiss(e) {
      this.updatePreferences({
        "Essential Cookies": document.querySelector(
          "[name=essential-cookies][data-gt-cookie-checkbox-input]"
        ).checked,
        Functional: document.querySelector("[name=functional][data-gt-cookie-checkbox-input]")
          .checked,
        Marketing: document.querySelector("[name=marketing][data-gt-cookie-checkbox-input]")
          .checked,
        Analytics: document.querySelector("[name=analytics][data-gt-cookie-checkbox-input]")
          .checked,
        Unclassified: document.querySelector("[name=unclassified][data-gt-cookie-checkbox-input]")
          .checked,
      });

      this.dismiss();
    }

    acceptAllAndDismiss() {
      this.checkboxElements.forEach(el => {
        el.checked = true;
      });

      this.updatePreferences({
        "Essential Cookies": true,
        Functional: true,
        Marketing: true,
        Analytics: true,
        Unclassified: true,
      });

      this.dismiss();
    }

    rejectAllAndDismiss() {
      this.checkboxElements.forEach(el => {
        el.checked = false;
      });

      this.updatePreferences({
        "Essential Cookies": true,
        Functional: false,
        Marketing: false,
        Analytics: false,
        Unclassified: false,
      });

      this.dismiss();
    }

    destroy() {
      this.hideDialog();
      this.hideWidget();

      this.wrapperElement.remove();
      this.themeStyleElement.remove();
      this.stylesStyleElement.remove();
    }

    reInitialise() {
      this.destroy();
      this.initialise(this.config, this.detectedCookies, this.client, true);
    }

    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  }
}
