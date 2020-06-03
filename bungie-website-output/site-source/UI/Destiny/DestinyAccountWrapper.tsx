// Created by larobinson, 2020
// Copyright Bungie, Inc.

import { BungieMembershipType, DestinyComponentType } from "@Enum";
import {
  GlobalStateComponentProps,
  withGlobalState,
} from "@Global/DataStore/GlobalStateDataStore";
import { Localizer } from "@Global/Localizer";
import { Characters, Platform, Responses, User } from "@Platform";
import DestinyCharacterSelector from "@UI/Destiny/DestinyCharacterSelector";
import { DestinyPlatformSelector } from "@UI/Destiny/DestinyPlatformSelector";
import { SystemDisabledHandler } from "@UI/Errors/SystemDisabledHandler";
import { TwoLineItem } from "@UI/UIKit/Companion/TwoLineItem";
import { Grid, GridCol } from "@UI/UIKit/Layout/Grid/Grid";
import { RequiresAuth } from "@UI/User/RequiresAuth";
import { UserUtils } from "@Utilities/UserUtils";
import * as React from "react";
import styles from "./DestinyAccountWrapper.module.scss";

// Required props
interface IDestinyAccountWrapperProps extends GlobalStateComponentProps<any> {
  /** Enables a parent to do something with the value returned when a different platform is selected */
  onPlatformChange?: () => void;
  /** Enables a parent to do something with the value returned when a different character is selected */
  onCharacterChange?: () => void;
}

// Default props - these will have values set in DestinyAccountWrapper.defaultProps
interface DefaultProps {
  includeBnetProfile?: boolean;
  /** This wrapper includes a platform and character selector and then a third place for a dropdown or image that is related to the specific use case */
  thirdElement?: any;
}

export type Props = IDestinyAccountWrapperProps & DefaultProps;

interface IDestinyAccountWrapperState {
  memberships: User.UserMembershipData;
  profileResponse: Responses.DestinyProfileResponse;

  isLoading: boolean;
  characterId: string;
  currentMembershipType: BungieMembershipType;
}

/**
 * DestinyAccountWrapper - Provides header with Destiny account info and guardian selectors
 *  *
 * @param {IDestinyAccountWrapperProps} props
 * @returns
 */
class DestinyAccountWrapper extends React.Component<
  Props,
  IDestinyAccountWrapperState
> {
  private static readonly InitialState: IDestinyAccountWrapperState = {
    memberships: null,
    profileResponse: null,
    characterId: "",
    isLoading: false,
    currentMembershipType: null,
  };

  constructor(props: Props) {
    super(props);

    this.state = DestinyAccountWrapper.InitialState;
  }

  public static defaultProps: DefaultProps = {
    includeBnetProfile: false,
  };

  public componentDidMount() {
    this.loadUserData();
  }

  public componentDidUpdate(prevProps: Props) {
    const wasAuthed = UserUtils.isAuthenticated(prevProps.globalState);
    const isNowAuthed = UserUtils.isAuthenticated(this.props.globalState);

    // if user logs in then need to load everything
    if (!wasAuthed && isNowAuthed) {
      this.loadUserData(true);
    }

    //user logs out
    if (wasAuthed && !isNowAuthed) {
      this.setState(DestinyAccountWrapper.InitialState);
    }
  }

  private get characters() {
    return this.state.profileResponse?.characters?.data;
  }

  public render() {
    if (this.state.isLoading) {
      return null;
    }

    const {
      currentMembershipType,
      memberships,
      profileResponse,
      characterId,
    } = this.state;
    const currentMembershipAsString = BungieMembershipType[
      currentMembershipType
    ] as EnumStrings<typeof BungieMembershipType>;
    const currentCharacter =
      this.characters &&
      Object.entries(this.characters).find(
        (value: [string, Characters.DestinyCharacterComponent]) => {
          const charComponent = value[1];

          return charComponent.characterId === characterId;
        }
      );

    const charactersLoaded =
      this.characters &&
      typeof profileResponse?.characterProgressions !== "undefined";

    return (
      <Grid>
        <SystemDisabledHandler systems={["Destiny2"]}>
          <RequiresAuth />
          <GridCol cols={12}>
            {memberships !== null && this.props.includeBnetProfile && (
              <div className={styles.bnetProfile}>
                <TwoLineItem
                  icon={
                    <img
                      src={currentCharacter[1].emblemPath}
                      style={{ width: "3rem", height: "3rem" }}
                      alt={Localizer.profile.EmblemAltText}
                    />
                  }
                  itemTitle={
                    this.props.globalState.loggedInUser.user.displayName
                  }
                  itemSubtitle={Localizer.Platforms[currentMembershipAsString]}
                />
              </div>
            )}
            {charactersLoaded && memberships !== null && (
              <DestinyPlatformSelector
                userMembershipData={memberships}
                onChange={(value: string) => this.updatePlatform(value)}
                defaultValue={currentMembershipType}
                crossSavePairingStatus={
                  this.props.globalState.crossSavePairingStatus
                }
              />
            )}

            {charactersLoaded && (
              <DestinyCharacterSelector
                characterComponent={this.characters}
                onChange={(value: string) => this.updateCharacter(value)}
              />
            )}

            {this.props.thirdElement}
          </GridCol>
          <GridCol cols={12}>{this.props.children}</GridCol>
        </SystemDisabledHandler>
      </Grid>
    );
  }

  private async loadUserData(forceReload = false) {
    let tempMemberships = this.state.memberships;
    const { currentMembershipType } = this.state;

    if (!tempMemberships || forceReload) {
      tempMemberships = await Platform.UserService.GetMembershipDataForCurrentUser();
    }

    const membership =
      typeof this.props.globalState.crossSavePairingStatus !== "undefined" &&
      typeof this.props.globalState.crossSavePairingStatus
        .primaryMembershipType !== "undefined"
        ? tempMemberships.destinyMemberships.find(
            (a) =>
              a.membershipType ===
              this.props.globalState.crossSavePairingStatus
                .primaryMembershipType
          )
        : currentMembershipType
        ? tempMemberships.destinyMemberships.find(
            (a) => a.membershipType === currentMembershipType
          )
        : tempMemberships.destinyMemberships[0];

    let profileResponse: Responses.DestinyProfileResponse = null;
    let targetCharacterId = "";

    if (typeof membership === "undefined") {
      // rare instance of bnet users without destiny membership, show the anonymous view

      this.setState({
        isLoading: false,
      });

      return;
    }

    try {
      profileResponse = await Platform.Destiny2Service.GetProfile(
        membership.membershipType,
        membership.membershipId,
        [
          DestinyComponentType.Profiles,
          DestinyComponentType.CharacterProgressions,
          DestinyComponentType.Characters,
        ]
      );

      const hasCharacterData =
        typeof profileResponse.characters !== "undefined" &&
        typeof profileResponse.characters.data !== "undefined";

      if (hasCharacterData) {
        targetCharacterId = Object.keys(profileResponse.characters.data)[0];
      }
    } catch {
      this.setState({
        isLoading: false,
      });

      console.log(
        `There was an error getting Destiny info for ${membership.displayName}(${membership.membershipId}): ${membership.membershipType}`
      );
    }

    this.setState({
      currentMembershipType: membership.membershipType,
      memberships: tempMemberships,
      isLoading: false,
      profileResponse,
      characterId: targetCharacterId,
    });
  }

  private updateCharacter(characterId: string) {
    this.setState({
      characterId: characterId,
    });
  }

  private async updatePlatform(platform: string) {
    if (platform !== this.state.currentMembershipType.toString()) {
      this.setState({
        isLoading: true,
      });

      const membershipType = this.state.memberships.destinyMemberships.find(
        (value) => value.membershipType.toString() === platform
      ).membershipType;

      //set the new membership, and clear out the outdated profileResponse so that it will update
      this.setState(
        {
          currentMembershipType: membershipType,
          characterId: "",
        },
        () => this.loadUserData()
      );
    }
  }
}

export default withGlobalState(DestinyAccountWrapper, [
  "loggedInUser",
  "crossSavePairingStatus",
]);
