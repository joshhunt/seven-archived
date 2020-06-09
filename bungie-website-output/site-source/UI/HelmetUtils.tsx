import * as React from "react";

export enum BodyClasses {
  /** No effect */
  None = 0,

  /** Removes the space above content that accounts for the header */
  NoSpacer = 1 << 0,

  /** Hides Service Alerts (mostly used for product pages) */
  HideServiceAlert = 1 << 1,

  // Follow this format for future entries: https://basarat.gitbooks.io/typescript/content/docs/enums.html#number-enums-as-flags
}

/**
 * Get special body classes given a flag value
 * @param classes BodyClasses flag (bitwise)
 */
export const SpecialBodyClasses = (classes: BodyClasses) => {
  const classList = [];

  if (classes & BodyClasses.NoSpacer) {
    classList.push("no-spacer");
  }

  if (classes & BodyClasses.HideServiceAlert) {
    classList.push("hide-service-alert");
  }

  return classList.join(" ");
};
