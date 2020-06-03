// Created by a-larobinson, 2019
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "../Redemption/CodesRedemption.module.scss";
import { Localizer } from "@Global/Localizer";
import {
  withGlobalState,
  GlobalStateComponentProps,
} from "@Global/DataStore/GlobalStateDataStore";
import { Grid, GridCol } from "@UI/UIKit/Layout/Grid/Grid";
import { BungieHelmet } from "@UI/Routing/BungieHelmet";
import { RequiresAuth } from "@UI/User/RequiresAuth";
import { CodesHistoryForm } from "./CodesHistoryForm";
import { UserUtils } from "@Utilities/UserUtils";
import { SpecialBodyClasses, BodyClasses } from "@UI/HelmetUtils";
import { CodesDataStore } from "../CodesDataStore";
import { RouterProps } from "react-router";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AclEnum } from "@Enum";

interface ICodesHistoryRouteParams {
  membershipId: string;
}

interface ICodesHistoryProps
  extends GlobalStateComponentProps<
      "loggedInUser" | "responsive" | "crossSavePairingStatus"
    >,
    RouteComponentProps<ICodesHistoryRouteParams> {}

interface ICodesHistoryState {}

/**
 * CodesHistory - Replace this description
 *  *
 * @param {ICodesHistoryProps} props
 * @returns
 */
class CodesHistory extends React.Component<
  ICodesHistoryProps,
  ICodesHistoryState
> {
  constructor(props: ICodesHistoryProps) {
    super(props);

    this.state = {};
  }

  public componentDidMount() {
    if (UserUtils.isAuthenticated(this.props.globalState)) {
      CodesDataStore.initialize();
    }
  }

  public componentDidUpdate(prevProps: ICodesHistoryProps) {
    const wasAuthed = UserUtils.isAuthenticated(prevProps.globalState);
    const isNowAuthed = UserUtils.isAuthenticated(this.props.globalState);

    // if user logs in then need to load everything
    if (!wasAuthed && isNowAuthed) {
      CodesDataStore.initialize();
    }
  }

  public render() {
    return (
      <React.Fragment>
        <BungieHelmet
          title={Localizer.CodeRedemption.CodeRedemption}
          image={"/7/ca/bungie/bgs/pcregister/engram.jpg"}
        >
          <body className={SpecialBodyClasses(BodyClasses.NoSpacer)} />
        </BungieHelmet>

        <RequiresAuth>
          <CodesHistoryForm
            crossSaveStatus={this.props.globalState.crossSavePairingStatus}
            membershipId={this.props.match.params.membershipId}
          />
        </RequiresAuth>
      </React.Fragment>
    );
  }
}

const CodesHistoryOuter = withGlobalState(CodesHistory, [
  "loggedInUser",
  "responsive",
  "crossSavePairingStatus",
]);
export default withRouter(CodesHistoryOuter);
