import { localStorageGetItem } from "./store/localStorage";

export function yettSetup(blacklists) {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  /*
   * If preferences have been previously saved, only block rejected lists.
   * Otherwise, use all blacklists
   */
  const preferences = localStorageGetItem("cookie_preferences");
  const blackList = preferences
    ? [
        ...(preferences["Functional"] ? [] : blacklists.functional),
        ...(preferences["Marketing"] ? [] : blacklists.marketing),
        ...(preferences["Analytics"] ? [] : blacklists.analytics),
        ...(preferences["Unclassified"] ? [] : blacklists.unclassified),
      ]
    : [
        ...blacklists.functional,
        ...blacklists.analytics,
        ...blacklists.marketing,
        ...blacklists.unclassified,
      ];

  /** Yett blacklist expects an array of regular expressions */
  if (typeof window.YETT_BLACKLIST === "undefined") {
    window.YETT_BLACKLIST = [];
  }
  window.YETT_BLACKLIST = [
    ...window.YETT_BLACKLIST,
    ...blackList.map(string => new RegExp(string)),
  ];

  /** Yett whitelist expects an array of regular expressions OR strings */
  if (typeof window.YETT_WHITELIST === "undefined") {
    window.YETT_WHITELIST = [];
  }

  window.YETT_WHITELIST = [
    ...window.YETT_WHITELIST,
    new RegExp(window.location.host),
    new RegExp("cdnjs.cloudflare.com"),
    new RegExp("jquery.com"),
    new RegExp("cdn.jsdelivr.net"),
    new RegExp("ajax.googleapis.com"),
    new RegExp("google.com/recaptcha/api"),
    /.*jquery(\.min)?\.(js|css)(\?.*)?/,
    /.*bootstrap(\.min)?\.(js|css)(\?.*)?/,
    /.*slick(\.min)?\.(js|css)(\?.*)?/,
    /.*modaal(\.min)?\.(js|css)(\?.*)?/,
  ];
}
