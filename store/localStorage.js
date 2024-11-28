// This storage key is mirrored in out GetTerms GTM Tag Template - any updates here **must** be reflected there too
const STORAGE_KEY = "getterms_cookie_consent";

/**
 * @param {String} key
 * @returns {*,null}
 */
export function localStorageGetItem(key) {
  const cache = window.localStorage.getItem(STORAGE_KEY);
  if (!cache) {
    return null;
  }

  const parsedCache = JSON.parse(cache);
  const item = parsedCache[key];
  if (!item) {
    return null;
  }

  return item;
}

/**
 * @param {String} key
 * @param {*} value
 */
export function localStorageSetItem(key, value) {
  const cache = window.localStorage.getItem(STORAGE_KEY);
  const parsedCache = cache ? JSON.parse(cache) : {};

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...parsedCache,
      [key]: value,
    })
  );
}
