import * as H from "history";
import pathToRegexp, { RegExpOptions, Token } from "path-to-regexp";
import { IMultiSiteLink } from "@Routes/RouteHelper";
import { LocalizerUtils } from "./LocalizerUtils";
import { StringUtils, StringCompareOptions } from "./StringUtils";

export class UrlUtils {
  public static readonly AppBaseUrl = "/7";

  /**
   * Converts an object to a query-string-style string
   * @param o
   */
  public static ObjectToQuery(o: any) {
    const pairs = Object.keys(o).map((a) => `${a}=${o[a]}`);

    return pairs.join("&");
  }

  /**
   * Converts a query string to an object
   * @param q
   */
  public static QueryToObject(
    q: string = location.search
  ): { [key: string]: string } {
    const output = {};

    const query = q.startsWith("?") ? q.substr(1) : q;

    if (query.indexOf("=") > -1) {
      query
        .split("&")
        .map((kvpString) => kvpString.split("="))
        .forEach((kvArr) => {
          output[kvArr[0]] = kvArr[1];
        });
    }

    return output;
  }

  /**
   * Given a router path and parameters, return a useable URL
   * @param path
   * @param params
   * @constructor
   */
  public static RouterPathToUrl<T>(
    path: string,
    params?: T,
    extra?: any
  ): string {
    let query = "";

    const allParams = {
      ...params,
      ...extra,
    };

    if (allParams) {
      // Check whether the requested params match the options available in the route.
      // If there are extras, convert them to query strings
      const tokens = pathToRegexp.parse(path);
      const validKeys = tokens
        .filter((t) => typeof t === "object")
        .map((t: any) => t.name);
      const toQueryStringify = Object.keys(allParams).filter(
        (k) => validKeys.indexOf(k) === -1
      );
      const queryObj = {};
      toQueryStringify.forEach((k) => (queryObj[k] = allParams[k]));

      query =
        toQueryStringify.length > 0
          ? `?${UrlUtils.ObjectToQuery(queryObj)}`
          : "";
    }

    const toPath = pathToRegexp.compile(path);

    const paramsWithLocale =
      allParams && "locale" in allParams
        ? allParams
        : { ...allParams, locale: LocalizerUtils.currentCultureName };

    return toPath(paramsWithLocale) + query;
  }

  /**
   * Given a router path and parameters, return a useable MultiSiteLink
   * @param path
   * @param params
   * @constructor
   */
  public static RouterPathToMultiLink<T>(
    path: string,
    params?: T,
    extra?: any
  ): IMultiSiteLink {
    return {
      legacy: false,
      url: UrlUtils.RouterPathToUrl(path, params, extra),
    } as IMultiSiteLink;
  }

  /**
   * Determine whether the current URL matches a router path
   * @param path The path to test against
   * @param options Regexp options
   * @constructor
   */
  public static UrlMatchesPath(path: string, options?: RegExpOptions) {
    if (path === null) {
      return false;
    }
    const parsed = pathToRegexp.parse(path);
    const regExp = pathToRegexp.tokensToRegExp(parsed, undefined, options);
    const actualPathname = location.pathname.startsWith(this.AppBaseUrl)
      ? location.pathname.substr(this.AppBaseUrl.length)
      : location.pathname;

    return actualPathname.match(regExp);
  }

  /**
   * Given a path, adds the appropriate locale to it
   * @param path
   * @param localeOverride
   */
  public static GetUrlForLocale(path: string, localeOverride: string = null) {
    const locale =
      localeOverride !== null
        ? localeOverride
        : LocalizerUtils.currentCultureName;
    const fixedPath = path.substr(0, 1) === "/" ? path : `/${path}`;

    return `/${locale}${fixedPath}`;
  }

  /**
   * Given a value (probably from a URL) convert it to some predictable type.
   * @param param The parameter to convert
   * @param outputBaseType The basic type of the output
   * @param enumBase If outputBaseType
   * @constructor
   */
  public static ParseParamToType<T>(
    param: string,
    outputBaseType: "string" | "number" | "enum" | "object",
    enumBase: any = null
  ) {
    let output: any = null;
    try {
      switch (outputBaseType) {
        case "string":
          output =
            typeof param === "object" ? JSON.stringify(param) : String(param);
          break;
        case "number":
          output = Number(param);
          break;
        case "object":
          output = JSON.parse(param);
          break;
        case "enum":
          if (enumBase === null) {
            throw new Error(
              "enumBase cannot be null if Enum is the outputBaseType"
            );
          }

          const paramAsNum = Number(param);
          output = isNaN(paramAsNum) ? paramAsNum : enumBase[param];
          break;
        default:
          output = (param as any) as T;
      }
    } catch (e) {
      console.error(
        `Error converting value ${param} to output type ${outputBaseType}.`,
        e
      );
    }

    return output as T;
  }

  /**
   * Gets the "action" of the current URL. This assumes URLs follow the pattern of /{locale}/{area}/{action}
   * @param l The location from RouteComponentProps
   */
  public static GetUrlAction(l: H.Location) {
    const matches = l.pathname.match(
      /\/[a-zA-Z\-]{1,6}\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+)\/?/
    );

    return matches && matches.length > 1 ? matches[1] : "";
  }

  /**
   * Redirect to a new URL, and return null so we can render nothing.
   * @param link The string or IMultiSiteLink to redirect to
   * @param p An object containing the History object (usually this.props)
   */
  public static PushRedirect<T extends { history: H.History }>(
    link: IMultiSiteLink | string,
    p: T
  ) {
    let url = "";

    if (typeof link === "object") {
      if (link.legacy) {
        location.href = link.url;

        return;
      } else {
        url = link.url;
      }
    } else {
      url = link;
    }

    p.history.push(url);

    return null;
  }

  /**
   * Returns the URL as a string regardless of the format it started as
   * @param originalUrl
   */
  public static getUrlAsString(originalUrl: string | IMultiSiteLink) {
    const isMultiLink = typeof originalUrl === "object";

    const finalUrl = isMultiLink
      ? (originalUrl as IMultiSiteLink).url
      : (originalUrl as string);

    return finalUrl;
  }

  /**
   * Returns the URL as a string regardless of the format it started as
   * @param originalUrl
   */
  public static getUrlAsMultiLink(
    originalUrl: string | IMultiSiteLink,
    legacy?: boolean
  ) {
    const isString = typeof originalUrl !== "object";

    const finalMultiLink = isString
      ? ({
          legacy: this.isLegacy(originalUrl?.toString() ?? "", legacy),
          url: originalUrl,
        } as IMultiSiteLink)
      : (originalUrl as IMultiSiteLink);

    return finalMultiLink;
  }

  /**
   * Converts the url provided to an achor tag so we can get stuff like pathname, etc.
   * @param urlAsString
   */
  public static getHrefAsLocation(urlAsString: string) {
    if (!urlAsString) {
      return null;
    }

    const a = document.createElement("a");
    a.href = urlAsString;

    return a;
  }

  /**
   * Returns true if this is a link to the old site
   * @param url
   */
  public static isLegacy(url: string, legacy?: boolean) {
    if (!url) {
      return true;
    }

    const anchorUrl = this.getHrefAsLocation(url);
    const nonStatic7Path = !!anchorUrl.pathname.match(/^\/7(?!\/ca\/).*/gi);
    const isReact = nonStatic7Path || (typeof legacy === "boolean" && !legacy);

    return !isReact;
  }

  /**
   * Returns the final URL we want to use in any situation
   * @param anchor
   * @param isLegacy
   * @param isBungieNet
   */
  public static resolveUrl(
    anchor: HTMLAnchorElement,
    isLegacy: boolean,
    isBungieNet: boolean
  ) {
    if (!anchor) {
      return null;
    }

    let resolved = anchor.href;

    if (!isBungieNet) {
      return resolved;
    }

    if (!isLegacy) {
      let path = anchor.pathname;

      if (path.startsWith("/7/")) {
        path = anchor.pathname.substr(2);
      }

      resolved = path + anchor.search + anchor.hash;
    }

    return resolved;
  }

  /**
   * Returns the final URL we want to use in any situation
   * @param link
   */
  public static resolveUrlFromMultiLink(link: IMultiSiteLink) {
    if (!link) {
      return null;
    }

    const anchor = this.getHrefAsLocation(link.url);
    const resolvedUrl = UrlUtils.resolveUrl(anchor, link.legacy, true);

    return resolvedUrl;
  }

  /**
   * Returns true if we want this to open in a new tab
   * @param isBungieNet
   * @param sameTab
   */
  public static shouldOpenNewTab(isBungieNet: boolean, sameTab?: boolean) {
    return !isBungieNet || (typeof sameTab === "boolean" && !false);
  }

  /**
   * Returns true if this link is staying within Bungie.net
   * @param hrefLocation
   */
  public static isBungieNet(hrefLocation: HTMLAnchorElement) {
    if (!hrefLocation) {
      return false;
    }

    const hostSplit = hrefLocation.host.split(".");
    const endUrl = hostSplit
      .slice(hostSplit.length - 2, hostSplit.length)
      .join(".");

    return (
      StringUtils.equals(
        endUrl,
        "bungie.net",
        StringCompareOptions.IgnoreCase
      ) ||
      StringUtils.equals(
        endUrl,
        "bng.local",
        StringCompareOptions.IgnoreCase
      ) ||
      StringUtils.equals(hrefLocation.host, "firehose")
    );
  }
}
