export class PromiseUtils {
  /**
   * Throws an error inside a promise
   * @param error
   */
  public static Rethrow<T>(error: T) {
    return new Promise((resolve, reject) => {
      reject(error);
    });
  }
}
