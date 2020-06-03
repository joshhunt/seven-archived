import { Localizer } from "@Global/Localizer";
import styles from "./BlizzardPCMigrationModal.module.scss";
import React, { RefObject } from "react";
import { Button } from "@UI/UIKit/Controls/Button/Button";
import { RouteHelper } from "@Routes/RouteHelper";
import {
  GlobalStateDataStore,
  GlobalState,
  GlobalStateComponentProps,
  withGlobalState,
} from "@Global/DataStore/GlobalStateDataStore";
import { Modal } from "@UI/UIKit/Controls/Modal/Modal";
import { DestroyCallback, DataStore } from "@Global/DataStore";
import { PCMigrationUtilities } from "@Areas/PCMigration/Shared/PCMigrationUtilities";
import { LocalStorageUtils } from "@Utilities/StorageUtils";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { UserUtils } from "@Utilities/UserUtils";

interface IBlizzardPCMigrationModalOpenerProps
  extends GlobalStateComponentProps<"credentialTypes" | "loggedInUser"> {}

interface IBlizzardPCMigrationModalProps {
  dismissModal: Function;
  globalState: GlobalState<"credentialTypes" | "loggedInUser">;
}

class BlizzardPCMigrationModalOpenerInternal extends React.Component<
  IBlizzardPCMigrationModalOpenerProps
> {
  private modal: RefObject<Modal>;
  private readonly localStorageKey = ConfigUtils.GetParameter(
    `PCMigrationLoginInterrupt`,
    `PCMigrationBlizzardLocalStorageKey`,
    ""
  );

  private readonly subs: DestroyCallback[] = [];

  public componentWillMount() {
    this.subs.push(
      GlobalStateDataStore.observe(
        (globalData: GlobalState<"credentialTypes" | "loggedInUser">) => {
          if (
            (typeof this.modal === "undefined" ||
              this.modal.current === null ||
              (this.modal.current !== null &&
                !this.modal.current.props.open)) &&
            !PCMigrationUtilities.IsLinked(globalData.credentialTypes) &&
            UserUtils.isAuthenticated(globalData) &&
            this.showPCMigrationModalToUser()
          ) {
            this.openModal();
          }
        },
        ["loggedInUser", "credentialTypes"]
      )
    );
  }

  public componentWillUnmount() {
    DataStore.destroyAll(...this.subs);
  }

  public render() {
    return null;
  }

  public openModal() {
    this.modal = Modal.open(
      <BlizzardPCMigrationModal
        globalState={this.props.globalState}
        dismissModal={() => this.closeModal()}
      />
    );

    this.updateLocalStorage();
  }

  private closeModal() {
    this.modal.current.close();
    this.updateLocalStorage();
  }

  private showPCMigrationModalToUser(): boolean {
    return (
      LocalStorageUtils.getItem(this.localStorageKey) === null ||
      LocalStorageUtils.getItem(this.localStorageKey) !== "false"
    );
  }

  private updateLocalStorage() {
    LocalStorageUtils.setItem(this.localStorageKey, "false");
  }
}

export const BlizzardPCMigrationModalOpener = withGlobalState(
  BlizzardPCMigrationModalOpenerInternal,
  ["credentialTypes", "loggedInUser"]
);

export class BlizzardPCMigrationModal extends React.Component<
  IBlizzardPCMigrationModalProps
> {
  public render() {
    return this.modalContent();
  }

  private modalContent() {
    const title = Localizer.PCMigration.steamModalTitle;
    const description = Localizer.PCMigration.steamModalDescription;
    const dismissButtonString = Localizer.PCMigration.steamModalDismiss;
    const learnMore = Localizer.PCMigration.steamModalAction;

    return (
      <div className={styles.blizzardRedirectModal}>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className={styles.buttons}>
          <Button
            buttonType={"gold"}
            onClick={() => this.props.dismissModal()}
            url={RouteHelper.PCMigration()}
          >
            {learnMore}
          </Button>
          <Button
            buttonType={"white"}
            onClick={() => this.props.dismissModal()}
          >
            {dismissButtonString}
          </Button>
        </div>
      </div>
    );
  }
}
