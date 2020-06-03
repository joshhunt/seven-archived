// Created by atseng, 2020
// Copyright Bungie, Inc.

import BeyondLightMedia from "@Areas/Destiny/BeyondLight/BeyondLightMedia";
import { BeyondLightUpdateDataStore } from "@Areas/Destiny/BeyondLight/DataStores/BeyondLightUpdateDataStore";
import { BeyondLightPhaseTwoDataStore } from "@Areas/Destiny/BeyondLight/DataStores/BeyondLightPhaseTwoDataStore";
import { BeyondLightPhaseThreeDataStore } from "@Areas/Destiny/BeyondLight/DataStores/BeyondLightPhaseThreeDataStore";
import PhaseOne from "@Areas/Destiny/BeyondLight/PhaseOne";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import PhaseTwo from "./BeyondLightPhaseTwo";
import PhaseThree from "@Areas/Destiny/BeyondLight/PhaseThree";
import { RouteDefs } from "@Routes/RouteDefs";
import * as React from "react";
import { Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { GlobalStateComponentProps } from "@Global/DataStore/GlobalStateDataStore";
import BeyondLightOverhaul from "./BeyondLightOverhaul";
import BeyondLightOriginal from "./BeyondLightOriginal";

// Required props
interface IBeyondLightProps
  extends RouteComponentProps,
    GlobalStateComponentProps<"responsive"> {}

// Default props - these will have values set in BeyondLight.defaultProps
interface DefaultProps {}

export type BeyondLightProps = IBeyondLightProps & DefaultProps;

interface IBeyondLightState {
  transparentMode: boolean;
  phaseOneActive: boolean;
  phaseTwoActive: boolean;
  phaseThreeActive: boolean;
}

enum blockType {
  "centered",
  "sided",
}

/**
 * BeyondLight - Replace this description
 *  *
 * @param {IBeyondLightProps} props
 * @returns
 */
class BeyondLight extends React.Component<BeyondLightProps, IBeyondLightState> {
  constructor(props: BeyondLightProps) {
    super(props);

    this.state = {
      phaseOneActive: BeyondLightUpdateDataStore.state.phaseOneActive,
      phaseTwoActive: BeyondLightPhaseTwoDataStore.state.phaseTwoActive,
      phaseThreeActive: BeyondLightPhaseThreeDataStore.state.phaseThreeActive,
      transparentMode: true,
    };
  }

  public static defaultProps: DefaultProps = {};

  public componentDidMount() {
    BeyondLightUpdateDataStore.initialize();
    BeyondLightUpdateDataStore.observe((d) =>
      this.setState({
        phaseOneActive: d.phaseOneActive,
      })
    );

    BeyondLightPhaseTwoDataStore.initialize();
    BeyondLightPhaseTwoDataStore.observe((d) =>
      this.setState({
        phaseTwoActive: d.phaseTwoActive,
      })
    );

    ConfigUtils.SystemStatus("BeyondLightPhase3") &&
      BeyondLightPhaseThreeDataStore.initialize();
    ConfigUtils.SystemStatus("BeyondLightPhase3") &&
      BeyondLightPhaseThreeDataStore.observe((d) =>
        this.setState({
          phaseThreeActive: d.phaseThreeActive,
        })
      );
  }

  public render() {
    const beyondLightPhase1 = RouteDefs.Areas.Destiny.getAction("PhaseOne")
      .path;
    const beyondLightPhase2 = RouteDefs.Areas.Destiny.getAction("PhaseTwo")
      .path;
    const beyondLightPhase3 =
      ConfigUtils.SystemStatus("BeyondLightPhase3") &&
      RouteDefs.Areas.Destiny.getAction("PhaseThree").path;
    const beyondLightPath = RouteDefs.Areas.Destiny.getAction("BeyondLight")
      .path;
    const beyondLightMediaPath = RouteDefs.Areas.Destiny.getAction("Media")
      .path;
    const phaseOneActive = this.state.phaseOneActive;
    const phaseTwoActive = this.state.phaseTwoActive;
    const phaseThreeActive = this.state.phaseThreeActive;

    return (
      <React.Fragment>
        <Switch>
          <Route path={beyondLightPath} exact>
            {phaseOneActive ? (
              <BeyondLightOverhaul
                phaseTwoActive={phaseTwoActive}
                phaseThreeActive={phaseThreeActive}
              />
            ) : (
              <BeyondLightOriginal />
            )}
          </Route>
          <Route path={beyondLightMediaPath} component={BeyondLightMedia} />
          <Route path={beyondLightPhase1} component={PhaseOne} />
          {phaseTwoActive && (
            <Route path={beyondLightPhase2} component={PhaseTwo} />
          )}
          {phaseThreeActive && (
            <Route path={beyondLightPhase3} component={PhaseThree} />
          )}
        </Switch>
      </React.Fragment>
    );
  }
}

export default BeyondLight;
