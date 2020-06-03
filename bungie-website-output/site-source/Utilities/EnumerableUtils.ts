import { Logger } from "@Global/Logger";

export type AnyObject<T> = { [key: string]: T } | { [key: number]: T };
export type IEnumerable<T> = T[] | AnyObject<T>;
export type EnumStrings<K> = keyof K & string;

export class EnumerableUtils {
  /**
   * Return the index of an item found in the supplied array.
   * @param array - array to scan
   * @param predicate - Function to run on each item in the array.
   * @returns -1 if the item was not found, or the index of the first item found.
   */
  public static firstIndexOf<T>(array: T[], predicate: (item: T) => boolean) {
    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i])) {
        return i;
      }
    }

    return -1;
  }

  /**
   * If any item in the enumerable matches the conditions in the predicate, returns true
   * @param enumerable
   * @param predicate
   */
  public static any<T>(
    enumerable: IEnumerable<T>,
    predicate: (item: T) => boolean
  ) {
    let matched = false;
    this.foreach(enumerable, (item) => {
      if (predicate(item)) {
        matched = true;
      }
    });

    return matched;
  }

  /**
   * Returns an array of values found within an enumerable, determined by the predicate's conditions
   * @param enumerable
   * @param predicate
   */
  public static select<T, U>(
    enumerable: IEnumerable<T>,
    predicate: (item: T) => U
  ) {
    const found: U[] = [];
    this.foreach(enumerable, (value) => {
      found.push(predicate(value));
    });

    return found;
  }

  /**
   * Returns an enumerable containing only items that match the conditions in the predicate
   * @param enumerable
   * @param predicate
   */
  public static where<T>(
    enumerable: IEnumerable<T>,
    predicate: (item: T) => boolean
  ) {
    const matching: T[] = [];

    this.foreach(enumerable, (item) => {
      if (predicate(item)) {
        matching.push(item);
      }
    });

    return matching;
  }

  /**
   * Returns the first instance of a value that matches the predicate
   * @param enumerable
   * @param predicate
   */
  public static firstOrDefault<T>(
    enumerable: IEnumerable<T>,
    predicate: (item: T) => boolean
  ) {
    const where = this.where(enumerable, predicate);
    if (where && where.length > 0) {
      return where[0];
    }

    return null;
  }

  /**
   * Return the intersction of two arrays
   * @param array1 - first array to scan
   * @param array2 - second array to scan for intersection with first array
   * @returns any[] - intersection of the two arrays
   */
  public static intersection(array1: any[], array2: any[]): any[] {
    let arraySecond = array2;
    let arrayFirst = array1;

    if (array1.length > array2.length) {
      [arraySecond, arrayFirst] = [array1, array2]; // indexOf to loop over shorter
    }

    return arrayFirst.filter((e) => {
      if (arraySecond.indexOf(e) !== -1) {
        return true;
      }

      return false;
    });
  }

  /**
   * Loops over an enumerable's values
   * @param enumerable
   * @param callback
   */
  public static foreach<T>(
    enumerable: IEnumerable<T>,
    callback: (val: T, index?: number) => void
  ) {
    if (!enumerable) {
      Logger.warn("enumerable is null or undefined");

      return;
    }

    if (enumerable instanceof Array) {
      for (let i = 0, length = enumerable.length; i < length; i++) {
        callback(enumerable[i], i);
      }
    } else {
      // Use Object.keys instead of a for...in loop because Edge doesn't like for...in in some cases for some reason
      for (const key of Object.keys(enumerable)) {
        if (enumerable.hasOwnProperty(key)) {
          callback(enumerable[key]);
        }
      }
    }
  }

  /**
   * Removes duplicates from an array of values
   * @param arr The array from which to remove duplicates
   */
  public static unique<T>(arr: T[]): T[] {
    const seen = [];
    const out = [];
    const len = arr.length;
    let j = 0;
    for (let i = 0; i < len; i++) {
      const item = arr[i];
      if (seen.indexOf(item) < 0) {
        seen.push(item);
        out[j++] = item;
      }
    }

    return out;
  }

  /**
   * Returns true if the array is null, undefined, or empty
   * @param arr
   */
  public static isNullOrEmpty<T>(arr: T[]) {
    return arr === null || arr === undefined || arr.length === 0;
  }
}
