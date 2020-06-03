// Created by a-tmorris, 2020
// Copyright Bungie, Inc.

import { Localizer } from "@Global/Localizer";
import { Content, Platform } from "@Platform";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { LocalizerUtils } from "@Utilities/LocalizerUtils";
import * as React from "react";
import { DataStore } from "@Global/DataStore";

export interface BeyondLightUpdateDataStorePayload {
  phaseOneActive: boolean;
  phaseOne: { [key: string]: string };
  phaseOneA: { [key: string]: string };
  phaseOneB: { [key: string]: string };
  phaseOneC: { [key: string]: string };
  phaseOneD: { [key: string]: string };
  homepage: { [key: string]: string };
}

class _BeyondLightUpdateDataStore extends DataStore<
  BeyondLightUpdateDataStorePayload
> {
  private initialized = false;
  private initialLocale = "";

  public static Instance = new _BeyondLightUpdateDataStore({
    phaseOneActive: true,
    phaseOne: {},
    phaseOneA: {},
    phaseOneB: {},
    phaseOneC: {},
    phaseOneD: {},
    homepage: {},
  });

  /**
   * Returns true if the requested phase has strings
   * @param phase
   */
  public phaseActive(phase: keyof BeyondLightUpdateDataStorePayload) {
    return Object.keys(this.state[phase]).length > 0;
  }

  public initialize() {
    if (
      this.initialized &&
      this.initialLocale === Localizer.CurrentCultureName
    ) {
      return;
    }

    this.initialized = true;
    this.initialLocale = Localizer.CurrentCultureName;

    this.update({
      phaseOneActive: ConfigUtils.SystemStatus("BeyondLightPhase1"),
    });

    this.fetchStrings();
  }

  private fetchStrings() {
    const firehosePhaseTags = [
      "phaseone",
      "bl-phase-one-a",
      "bl-phase-one-b",
      "bl-phase-one-c",
      "bl-phase-one-d",
      "bl-update",
    ];

    // Load all items, and if they fail, just ignore it.
    const promises: Promise<
      Content.ContentItemPublicContract
    >[] = firehosePhaseTags.map((phaseTag) =>
      Platform.ContentService.GetContentByTagAndType(
        phaseTag,
        "StringCollection",
        Localizer.CurrentCultureName,
        false
      ).catch(() => void 0)
    );

    Promise.all(promises).then((rawAllPhaseData) => {
      const transformed = rawAllPhaseData.map((rawPhase) =>
        LocalizerUtils.stringCollectionToObject(rawPhase)
      );

      this.update({
        phaseOne: transformed[0] ?? {},
        phaseOneA: transformed[1] ?? {},
        phaseOneB: transformed[2] ?? {},
        phaseOneC: transformed[3] ?? {},
        phaseOneD: transformed[4] ?? {},
        homepage: transformed[5] ?? {},
      });
    });
  }
}

export const BeyondLightUpdateDataStore = _BeyondLightUpdateDataStore.Instance;
