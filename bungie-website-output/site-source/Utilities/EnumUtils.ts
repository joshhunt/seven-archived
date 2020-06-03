export class EnumUtils {
  /**
   * Checks for a flag in a flag's value
   * @param flag The flag to check for
   * @param flagsEnum The value to check the flag for
   */
  public static hasFlag(flag: number, flagsEnum: any): boolean {
    return !!(flagsEnum & flag);
  }

  /**
   * Get the string keys of an enum as an array (excludes the numeric keys)
   * @param enumType The enum type in question (e.g. Globals.BungieMembershipType)
   */
  public static getStringKeys<T>(enumType: any) {
    return Object.keys(enumType).filter((a: string) =>
      isNaN(parseInt(a))
    ) as (keyof typeof enumType)[];
  }
}
