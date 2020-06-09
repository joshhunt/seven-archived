// Created by a-larobinson, 2019
// Copyright Bungie, Inc.

import * as React from "react";
import { ValidSystemNames, SystemNames } from "@Global/SystemNames";
import { GlobalStateDataStore } from "@Global/DataStore/GlobalStateDataStore";
import { DestroyCallback } from "@Global/DataStore";
import { Localizer } from "@Global/Localizer";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import styles from "./SystemDisabledHandler.module.scss";

interface ISystemDisabledHandlerProps extends React.HTMLProps<HTMLDivElement> {
  systems: ValidSystemNames[];
  customString?: string;
}

interface ISystemDisabledHandlerState {
  anySystemDisabled: boolean;
}

/**
 * SystemDisabledHandler - Replace this description
 *  *
 * @param {ISystemDisabledHandlerProps} props
 * @returns
 */
export class SystemDisabledHandler extends React.Component<
  ISystemDisabledHandlerProps,
  ISystemDisabledHandlerState
> {
  constructor(props: ISystemDisabledHandlerProps) {
    super(props);

    this.state = {
      anySystemDisabled: false,
    };
  }

  public componentDidMount() {
    // Of the systems passed down through props, see if any are disabled
    const anySystemDisabled = this.props.systems.some(
      (sys) => !ConfigUtils.SystemStatus(SystemNames[sys])
    );
    this.setState({
      anySystemDisabled,
    });
  }

  public render() {
    return this.state.anySystemDisabled ? (
      <div className={styles.disabledWrapper}>
        <div>
          {this.props.customString?.length
            ? this.props.customString
            : Localizer.Errors.DefaultSystemOffline}
        </div>
      </div>
    ) : (
      <div>{this.props.children || null}</div>
    );
  }
}
