// Created by larobinson, 2020
// Copyright Bungie, Inc.

import DestinyAccountWrapper from "@UI/Destiny/DestinyAccountWrapper";
import DestinyActivityModesSelector from "@UI/Destiny/DestinyActivityModeSelector";
import * as React from "react";
import styles from "./GameHistory.module.scss";
import { BungieHelmet } from "@UI/Routing/BungieHelmet";
import { SpecialBodyClasses, BodyClasses } from "@UI/HelmetUtils";
import { Localizer } from "@Global/Localizer";
import { Img } from "@Helpers";

// Required props
interface IGameHistoryProps {}

// Default props - these will have values set in GameHistory.defaultProps
interface DefaultProps {}

export type GameHistoryProps = IGameHistoryProps & DefaultProps;

interface IGameHistoryState {}

/**
 * GameHistory - Replace this description
 *  *
 * @param {IGameHistoryProps} props
 * @returns
 */
export class GameHistory extends React.Component<
  GameHistoryProps,
  IGameHistoryState
> {
  constructor(props: GameHistoryProps) {
    super(props);

    this.state = {};
  }

  public static defaultProps: DefaultProps = {};

  public render() {
    return (
      <>
        <BungieHelmet
          title={Localizer.profile.SubNav_GameHistory}
          image={Img("/ca/destiny/bgs/new_light/newlight_pvp_1_16x9.jpg")}
        >
          <body className={SpecialBodyClasses(BodyClasses.NoSpacer)} />
        </BungieHelmet>
        <div className={styles.header}>
          <h1>{Localizer.profile.SubNav_GameHistory}</h1>
        </div>
        <DestinyAccountWrapper
          includeBnetProfile={true}
          thirdElement={
            <DestinyActivityModesSelector
              className={styles.activityModeSelector}
            />
          }
        >
          <div />
        </DestinyAccountWrapper>
      </>
    );
  }
}
