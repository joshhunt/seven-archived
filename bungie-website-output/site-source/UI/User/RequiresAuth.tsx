import * as React from "react";
import {
  GlobalStateDataStore,
  GlobalState,
} from "@Global/DataStore/GlobalStateDataStore";
import { DestroyCallback, DataStore } from "@Global/DataStore";
import { AuthTrigger } from "@UI/Navigation/AuthTrigger";
import * as Globals from "@Enum";
import { Localizer } from "@Global/Localizer";
import { Button } from "@UI/UIKit/Controls/Button/Button";
import styles from "./RequiresAuth.module.scss";
import { SpinnerContainer } from "@UI/UIKit/Controls/Spinner";
import { Contract, Models } from "@Platform";
import { withRouter, RouteComponentProps } from "react-router-dom";
import classNames from "classnames";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { SystemDisabledHandler } from "@UI/Errors/SystemDisabledHandler";

export type AuthTemporaryGlobalState = GlobalState<
  "loggedInUser" | "credentialTypes"
>;

interface IRequiresAuthProps extends RouteComponentProps {
  /** If you want to do something with global state on sign in, we'll pass it here. This global state will not keep updating! */
  onSignIn?: (temporaryGlobalState: AuthTemporaryGlobalState) => void;
  customLabel?: string;
}

interface IRequiresAuthState {
  loggedInUser: Contract.UserDetail;
  coreSettings: Models.CoreSettingsConfiguration;
}

/**
 * This component should be used when
 *  *
 * @param {IRequiresAuthProps} props
 * @returns
 */
class RequiresAuthInternal extends React.Component<
  IRequiresAuthProps,
  IRequiresAuthState
> {
  private destroyGlobalStateListener: DestroyCallback;
  private signInAttemptedFlag = false;

  constructor(props: IRequiresAuthProps) {
    super(props);

    this.state = {
      loggedInUser: GlobalStateDataStore.state.loggedInUser,
      coreSettings: GlobalStateDataStore.state.coreSettings,
    };
  }

  public static defaultProps = {
    onSignIn: () => {
      // nothing
    },
  };

  public componentDidMount() {
    this.destroyGlobalStateListener = GlobalStateDataStore.observe(
      (data) => {
        // If we get a global state update, check to see if we signed in between them
        if (
          this.signInAttemptedFlag &&
          !this.state.loggedInUser &&
          data.loggedInUser
        ) {
          // Give all the other subscribers
          this.props.onSignIn && this.props.onSignIn(data);
        }

        this.setState({
          loggedInUser: data.loggedInUser,
          coreSettings: data.coreSettings,
        });

        this.signInAttemptedFlag = false;
      },
      ["loggedInUser", "credentialTypes"]
    );
  }

  public componentWillUnmount() {
    this.destroyGlobalStateListener && this.destroyGlobalStateListener();
  }

  private readonly onAuthWindowClosed = () => {
    this.signInAttemptedFlag = true;
  };

  public render() {
    const authed = this.state.loggedInUser !== undefined;

    if (!authed && !this.state.coreSettings) {
      return <SpinnerContainer loading={true} />;
    } else if (authed) {
      return this.props.children || null;
    }

    const coreSettings = this.state.coreSettings;
    const psnSystem = coreSettings.systems.PSNAuth;
    const xuidSystem = coreSettings.systems.XuidAuth;
    const battleNetSystem = coreSettings.systems.Blizzard;
    const stadiaSystem = coreSettings.systems.StadiaIdAuth;
    const steamEnabled = ConfigUtils.SystemStatus("SteamIdAuth");
    const prePCMigration = ConfigUtils.SystemStatus("PrePCMigration");

    const prePCMigrationSteamEnabled = steamEnabled && prePCMigration;

    const specialHeader = Localizer.Registration.steamsigninisnowavailable;
    const specialLabel = Localizer.Registration.bungienetnowsupportssteam;

    return (
      <SystemDisabledHandler systems={["Authentication"]}>
        <div className={classNames(styles.requiresAuth, styles.steamEnabled)}>
          {this.props.customLabel?.length && (
            <div className={styles.label}>{this.props.customLabel}</div>
          )}

          {prePCMigrationSteamEnabled && (
            <h1 className={styles.specialHeader}>{specialHeader}</h1>
          )}

          {typeof this.props.customLabel === "undefined" ||
            (this.props.customLabel?.length === 0 && (
              <React.Fragment>
                <div className={styles.label}>
                  {prePCMigrationSteamEnabled
                    ? specialLabel
                    : Localizer.Nav.LogInToContinue}
                </div>
              </React.Fragment>
            ))}
          <div className={styles.buttonWrapper}>
            {psnSystem && psnSystem.enabled && (
              <AuthTrigger
                key={Globals.BungieCredentialType.Psnid}
                credential={Globals.BungieCredentialType.Psnid}
                onAuthWindowClosed={this.onAuthWindowClosed}
              >
                <Button
                  buttonType={"gold"}
                  className={styles.authTriggerButton}
                >
                  {Localizer.Registration.networksigninoptionplaystationupper}
                </Button>
              </AuthTrigger>
            )}
            {xuidSystem && xuidSystem.enabled && (
              <AuthTrigger
                key={Globals.BungieCredentialType.Xuid}
                credential={Globals.BungieCredentialType.Xuid}
                onAuthWindowClosed={this.onAuthWindowClosed}
              >
                <Button
                  buttonType={"gold"}
                  className={styles.authTriggerButton}
                >
                  {Localizer.Registration.networksigninoptionxboxupper}
                </Button>
              </AuthTrigger>
            )}
            {battleNetSystem && battleNetSystem.enabled && (
              <AuthTrigger
                key={Globals.BungieCredentialType.BattleNetId}
                credential={Globals.BungieCredentialType.BattleNetId}
                onAuthWindowClosed={this.onAuthWindowClosed}
              >
                <Button
                  buttonType={"gold"}
                  className={styles.authTriggerButton}
                >
                  {Localizer.Registration.networksigninoptionblizzardupper}
                </Button>
              </AuthTrigger>
            )}
            {this.showSteamButton()}
            {stadiaSystem && stadiaSystem.enabled && (
              <AuthTrigger
                key={Globals.BungieCredentialType.StadiaId}
                credential={Globals.BungieCredentialType.StadiaId}
                onAuthWindowClosed={this.onAuthWindowClosed}
              >
                <Button
                  buttonType={"gold"}
                  className={styles.authTriggerButton}
                >
                  {Localizer.Registration.networksigninoptionstadiaupper}
                </Button>
              </AuthTrigger>
            )}
          </div>
        </div>
      </SystemDisabledHandler>
    );
  }

  private showSteamButton(): React.ReactElement {
    const steamEnabled = ConfigUtils.SystemStatus("SteamIdAuth");
    const prePCMigration = ConfigUtils.SystemStatus("PrePCMigration");

    const steamAuthDesc = Localizer.Registration.ifyouarenewtobungienet;

    if (steamEnabled) {
      const SteamAuthTrigger = (props: { buttonClass: string }) => (
        <AuthTrigger
          key={Globals.BungieCredentialType.SteamId}
          credential={Globals.BungieCredentialType.SteamId}
          onAuthWindowClosed={this.onAuthWindowClosed}
        >
          <Button buttonType={"gold"} className={props.buttonClass}>
            {Localizer.Registration.networksigninoptionsteamupper}
          </Button>
        </AuthTrigger>
      );

      if (prePCMigration) {
        return (
          <div className={styles.steamAuthSection}>
            <p>{steamAuthDesc}</p>
            <SteamAuthTrigger buttonClass={styles.steamAuthTriggerButton} />
          </div>
        );
      } else {
        return <SteamAuthTrigger buttonClass={styles.authTriggerButton} />;
      }
    } else {
      return null;
    }
  }
}

export const RequiresAuth = withRouter(RequiresAuthInternal);
