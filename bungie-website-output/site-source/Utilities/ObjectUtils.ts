import { parse } from "path-to-regexp";

export class ObjectUtils {
  /**
   * Behaves like $.extend() from jQuery
   * @param target The object to extend
   * @param sources The extension source
   */
  public static extend(target: any, ...sources: any[]) {
    if (!sources.length) {
      return target;
    }
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }
          this.extend(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.extend(target, ...sources);
  }

  /**
   * Convert a key-value pair object to a query-string-style string. (e.g. {a:1, b:2} -> a=1&b=2)
   * @param item
   */
  public static objectToKvpString(item: any) {
    const keys = Object.keys(item);
    const kvps = keys.map((key) => `${key}=${item[key]}`);

    return kvps.join("&");
  }

  private static isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
  }
}
