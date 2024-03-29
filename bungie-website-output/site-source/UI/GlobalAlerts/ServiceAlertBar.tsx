import { SpinnerContainer } from "@UI/UIKit/Controls/Spinner";
import * as React from "react";
import { Platform, Content } from "@Platform";
import { Localizer } from "@Global/Localizer";
import styles from "./ServiceAlertBar.module.scss";
import { Icon } from "@UI/UIKit/Controls/Icon";
import { GlobalAlertLevel, GlobalAlertType } from "@Enum";
import { EnumerableUtils } from "@Utilities/EnumerableUtils";
import classNames from "classnames";
import { GridCol, Grid } from "@UI/UIKit/Layout/Grid/Grid";
import { Anchor } from "@UI/Navigation/Anchor";
import { Respond } from "@Boot/Respond";
import { ResponsiveSize, IResponsiveState } from "@Boot/Responsive";
import {
  withGlobalState,
  GlobalStateComponentProps,
} from "@Global/DataStore/GlobalStateDataStore";
import { RouteHelper } from "@Routes/RouteHelper";
import { StringUtils } from "@Utilities/StringUtils";

interface IServiceAlertProps extends GlobalStateComponentProps<"responsive"> {}

interface IServiceAlertState {
  contentItem: Content.ContentItemPublicContract[];
}

/**
 * Renders a content item either by ID or tag and type
 *  *
 * @param {IServiceAlertProps} props
 * @returns
 */
class ServiceAlertBarInner extends React.Component<
  IServiceAlertProps,
  IServiceAlertState
> {
  constructor(props: IServiceAlertProps) {
    super(props);

    this.state = {
      contentItem: null,
    };
  }

  public componentDidMount() {
    Platform.ContentService.GetContentByTagAndType(
      "global-alert-content-set",
      "ContentSet",
      Localizer.CurrentCultureName,
      true
    ).then((contentSet) => {
      if (contentSet) {
        const allItems: Content.ContentItemPublicContract[] =
          contentSet.properties["ContentItems"];
        const globalAlerts = allItems.filter((i) => i.cType === "GlobalAlert");

        this.setState({
          contentItem: globalAlerts,
        });
      }
    });
  }

  public render() {
    return (
      <div className={styles.wrapper}>
        {this.state.contentItem?.map((firehoseItem, i) => {
          return (
            <GlobalAlert
              key={i}
              globalAlert={firehoseItem}
              responsiveState={this.props.globalState.responsive}
            />
          );
        })}
      </div>
    );
  }
}

interface IGlobalAlertProps {
  globalAlert: Content.ContentItemPublicContract;
  responsiveState: IResponsiveState;
}

const GlobalAlert = (props: IGlobalAlertProps) => {
  const alert = props.globalAlert.properties;
  let alertLevelString = isNaN(alert.AlertLevel)
    ? alert.AlertLevel
    : GlobalAlertLevel[alert.AlertLevel];

  if (alertLevelString === "Unknown") {
    alertLevelString = GlobalAlertLevel[3];
  }

  alert.AlertType = GlobalAlertType.GlobalAlert;
  alert.AlertTimestamp = alert.creationDate;
  const alertKey = alert.CannedMessage;

  const alertLink =
    alert.AlertLink !== null &&
    typeof alert.AlertLink === "string" &&
    !StringUtils.isNullOrWhiteSpace(alert.AlertLink)
      ? alert.AlertLink.toLowerCase()
      : RouteHelper.Help();

  return (
    <Anchor url={alertLink}>
      <div
        className={classNames(
          styles.globalServiceAlertBar,
          styles[alertLevelString.toLowerCase()]
        )}
        key={alert.Title}
      >
        <Icon
          iconName={"exclamation-circle"}
          iconType={"fa"}
          className={styles.icon}
        />
        <div className={styles.title}>{Localizer.Errors.ServiceAlert} </div>
        {
          <Respond
            at={ResponsiveSize.mobile}
            hide={true}
            responsive={props.responsiveState}
          >
            <AlertMessage customHTML={alert.CustomHTML} alertKey={alertKey} />
          </Respond>
        }
      </div>
    </Anchor>
  );
};

interface IAlertMessageProps {
  customHTML: string;
  alertKey: string;
}

const AlertMessage = (props: IAlertMessageProps) => {
  const backupMessage = `Alert${props.alertKey}`;
  // I don't know why when you leave the customHTML box empty in firehose it saves it as a "<br>" but so be it
  const useCustomHtml =
    !StringUtils.isNullOrWhiteSpace(props.customHTML) &&
    props.customHTML !== "<br>";

  return useCustomHtml ? (
    <div dangerouslySetInnerHTML={{ __html: props.customHTML }} />
  ) : (
    <div> {Localizer.Globals[backupMessage]} </div>
  );
};

export const ServiceAlertBar = withGlobalState(ServiceAlertBarInner, [
  "responsive",
]);
