export const BROWSER_SUPPORT = (function testSupport() {
  if (!Object.getOwnPropertyDescriptor || !Object.defineProperty) {
    return false;
  }
  let desc = getCookieDesc();
  return (
    desc && typeof desc.get === "function" && typeof desc.set === "function" && desc.configurable
  );
})();

function getCookieDesc() {
  return (
    Object.getOwnPropertyDescriptor(Document.prototype, "cookie") ||
    Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "cookie")
  );
}

function startsWithAny(str, prefixes) {
  return prefixes.some(prefix => str.startsWith(prefix));
}

function getAllCookies() {
  const cookies = document.cookie.split("; ");
  const cookiesArray = [];

  cookies.forEach(cookie => {
    const [name, value] = cookie.split("=");
    const decodedValue = decodeURIComponent(value);
    cookiesArray.push({ name, value: decodedValue });
  });

  return cookiesArray;
}

function deleteCookie(name) {
  const domain = window.location.hostname;
  const path = "/";
  const expires = "Thu, 01 Jan 1970 00:00:00 UTC";

  document.cookie = `${name}=; expires=${expires}; path=${path}; domain=${domain};`;
  document.cookie = `${name}=; expires=${expires}; path=${path}; domain=.${domain};`;
}

export default function({ blockList = [] }) {
  if (!BROWSER_SUPPORT) {
    return false;
  }

  const cookieDesc = getCookieDesc();

  if (!cookieDesc || !cookieDesc.get || !cookieDesc.set) {
    return false;
  }

  const isBlockListed = cookieName => {
    return startsWithAny(cookieName, blockList);
  };

  const allCookies = getAllCookies();

  allCookies.forEach(existingCookie => {
    if (isBlockListed(existingCookie.name)) {
      deleteCookie(existingCookie.name);
    }
  });

  Object.defineProperty(document, "cookie", {
    configurable: true,
    enumerable: cookieDesc.enumerable,
    get: function() {
      return cookieDesc.get.call(document);
    },
    set: function(cookie) {
      let cookieName = cookie.substring(0, cookie.indexOf("=")).trim();

      if (isBlockListed(cookieName)) {
        return;
      }
      cookieDesc.set.call(document, cookie);
    },
  });

  return function reset() {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      enumerable: cookieDesc.enumerable,
      get: cookieDesc.get,
      set: cookieDesc.set,
    });
  };
}
