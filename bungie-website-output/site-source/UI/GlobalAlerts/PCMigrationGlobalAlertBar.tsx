import React from "react";
import styles from "./PCMigrationGlobalAlertBar.module.scss";
import { Localizer } from "@Global/Localizer";
import {
  withGlobalState,
  GlobalStateComponentProps,
} from "@Global/DataStore/GlobalStateDataStore";
import classNames from "classnames";
import { RouteHelper } from "@Routes/RouteHelper";
import { RouteComponentProps } from "react-router-dom";
import { Contract, Platform, User } from "@Platform";
import {
  DestroyCallback,
  DataStoreObserver,
  DataStore,
} from "@Global/DataStore";
import {
  PCMigrationUserDataStore,
  IPCMigrationUserData,
} from "@UI/User/PCMigrationUserDataStore";
import { PCMigrationUtilities } from "@Areas/PCMigration/Shared/PCMigrationUtilities";
import { GlobalBar } from "./GlobalBar";
import { BungieCredentialType } from "@Enum";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { UserUtils } from "@Utilities/UserUtils";
import { LocalStorageUtils } from "@Utilities/StorageUtils";

interface IPCMigrationGlobalAlertProps
  extends GlobalStateComponentProps<"loggedInUser" | "credentialTypes">,
    RouteComponentProps {}

interface IPCMigrationGlobalAlertState {
  user: Contract.UserDetail;
  webmasterEnabled: boolean;
  isPostRelease: boolean;
  localStorageAllowShow: boolean;
  userData: IPCMigrationUserData;
  transferComplete: boolean;
  transferInProgress: boolean;
  steamDestinationDisplayName: string;
}

class PCMigrationGlobalAlert extends React.Component<
  IPCMigrationGlobalAlertProps,
  IPCMigrationGlobalAlertState
> {
  private readonly destroys: DestroyCallback[] = [];
  private readonly localStorageKey: string = "show-pc-migration-alert";

  constructor(props) {
    super(props);

    this.state = {
      user: this.props.globalState.loggedInUser,
      webmasterEnabled: ConfigUtils.SystemStatus("PCMigrationGlobalAlertsBar"),
      isPostRelease: true,
      localStorageAllowShow: true,
      userData: PCMigrationUserDataStore.state,
      transferComplete: false,
      transferInProgress: false,
      steamDestinationDisplayName: "",
    };

    this.removeBar = this.removeBar.bind(this);
  }

  public componentDidUpdate() {
    const barShown = this.showBarToUser();
    document.documentElement.classList.toggle("global-bar-shown", barShown);
  }

  public componentWillMount() {
    this.getLocalStorageAlertVisibility();

    this.destroys.push(
      PCMigrationUserDataStore.observe((data: IPCMigrationUserData) => {
        this.checkForTransferState();

        this.setState({
          userData: data,
        });
      })
    );
  }

  public componentWillUnmount() {
    DataStore.destroyAll(...this.destroys);
  }

  public render() {
    return (
      <React.Fragment>
        {this.showBarToUser() && (
          <GlobalBar
            barClassNames={classNames(styles.pcmigration, {
              [styles.isLinked]: this.isLinked(),
              [styles.steamLinked]: PCMigrationUtilities.HasCredentialType(
                this.props.globalState.credentialTypes,
                BungieCredentialType.SteamId
              ),
              [styles.anonymous]: !UserUtils.isAuthenticated(
                this.props.globalState
              ),
            })}
            url={RouteHelper.PCMigration()}
            message={this.populateMessage()}
            showCheckIcon={true}
            showWarningIcon={true}
            removeable={true}
            localStorageKey={this.localStorageKey}
          />
        )}
      </React.Fragment>
    );
  }

  private isLinked(): boolean {
    return (
      this.props.globalState.loggedInUser &&
      PCMigrationUtilities.IsLinked(this.props.globalState.credentialTypes)
    );
  }

  private showBarToUser(): boolean {
    if (!this.state.webmasterEnabled) {
      return false;
    }

    if (this.state.userData.forceHidden) {
      return false;
    }

    //post migration - don't show to steam only users
    if (
      !PCMigrationUtilities.HasCredentialType(
        this.props.globalState.credentialTypes,
        BungieCredentialType.BattleNetId
      ) &&
      PCMigrationUtilities.HasCredentialType(
        this.props.globalState.credentialTypes,
        BungieCredentialType.SteamId
      )
    ) {
      return false;
    }

    if (
      !PCMigrationUtilities.HasCredentialType(
        this.props.globalState.credentialTypes,
        BungieCredentialType.BattleNetId
      ) &&
      !PCMigrationUtilities.HasCredentialType(
        this.props.globalState.credentialTypes,
        BungieCredentialType.SteamId
      )
    ) {
      return false;
    }

    if (!this.state.localStorageAllowShow) {
      return false;
    }

    return true;
  }

  private removeBar(e: React.MouseEvent<HTMLElement, MouseEvent>): void {
    e.stopPropagation();

    e.preventDefault();

    this.updateLocalStorageAlertVisibility(false);
  }

  private populateMessage(): string {
    const loc = Localizer.Pcmigration;

    // pre-warning
    let message = !UserUtils.isAuthenticated(this.props.globalState)
      ? loc.Destiny2PcIsMovingToSteamAnnon
      : loc.Destiny2PcIsMovingToSteam;

    if (this.state.isPostRelease) {
      // post-warning
      message = loc.destiny2hasmovedtosteam;

      if (this.props.globalState.loggedInUser) {
        const displayName =
          this.state.steamDestinationDisplayName !== "" &&
          this.state.steamDestinationDisplayName !==
            this.props.globalState.loggedInUser.steamDisplayName
            ? this.state.steamDestinationDisplayName
            : this.props.globalState.loggedInUser.steamDisplayName;

        if (this.isLinked()) {
          // linked

          message = Localizer.Pcmigration.YourPcAccountsAreLinked;

          if (this.state.transferComplete) {
            // and is transfer complete
            message = Localizer.Format(loc.destiny2hasmovedtosteampost, {
              displayName: displayName,
            });
          }
        }
      }
    }

    return message;
  }

  private getLocalStorageAlertVisibility() {
    if (
      typeof LocalStorageUtils.getItem("show-pc-migration-alert") ===
        "undefined" ||
      LocalStorageUtils.getItem("show-pc-migration-alert") === null
    ) {
      LocalStorageUtils.setItem("show-pc-migration-alert", "true");
    }

    this.setState({
      localStorageAllowShow:
        LocalStorageUtils.getItem("show-pc-migration-alert") === "false"
          ? false
          : true,
    });
  }

  private updateLocalStorageAlertVisibility(newValue: boolean) {
    this.setState({
      localStorageAllowShow: newValue,
    });

    LocalStorageUtils.setItem("show-pc-migration-alert", newValue.toString());
  }

  private checkForTransferState() {
    if (
      UserUtils.isAuthenticated(this.props.globalState) &&
      PCMigrationUtilities.HasCredentialType(
        this.props.globalState.credentialTypes,
        BungieCredentialType.BattleNetId
      )
    ) {
      Platform.UserService.GetBlizzardToSteamDestinyMigrationStatus(
        BungieCredentialType.BattleNetId
      ).then((response: User.BlizzardToSteamMigrationStatusResponse) => {
        this.setState({
          steamDestinationDisplayName: response.DestinationSteamDisplayName,
        });

        this.setState({
          transferInProgress:
            response.MigrationStarted &&
            !PCMigrationUtilities.MigrationIsComplete(response),
          transferComplete: PCMigrationUtilities.MigrationIsComplete(response),
        });
      });
    }
  }
}

export default withGlobalState(PCMigrationGlobalAlert, [
  "loggedInUser",
  "credentialTypes",
]);
