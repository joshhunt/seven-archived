import * as React from "react";
import { DetailedError } from "./CustomErrors";
import styles from "./BasicErrorBoundary.module.scss";
import { Grid, GridCol } from "@UIKit/Layout/Grid/Grid";
import Helmet from "react-helmet";
import * as Globals from "@Enum";
import { Logger } from "@Global/Logger";
import { BodyClasses, SpecialBodyClasses } from "@UI/HelmetUtils";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { DestroyCallback } from "@Global/DataStore";
import { BungieHelmet } from "@UI/Routing/BungieHelmet";
import { Localizer } from "@Global/Localizer";

interface IBasicErrorBoundaryProps extends RouteComponentProps {}

interface IBasicErrorBoundaryState {
  error: Error;
}

/**
 * Displays basic error information
 *  *
 * @param {IBasicErrorBoundaryProps} props
 * @returns
 */
class BasicErrorBoundaryInner extends React.Component<
  IBasicErrorBoundaryProps,
  IBasicErrorBoundaryState
> {
  private destroyListener: DestroyCallback;

  constructor(props: IBasicErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
    };
  }

  public render() {
    return this.state.error ? this.renderErrorDisplay() : this.props.children;
  }

  public componentDidMount() {
    this.destroyListener = this.props.history.listen(() => {
      this.setState({
        error: null,
      });
    });
  }

  public componentWillUnmount() {
    this.destroyListener();
  }

  public componentDidCatch(error: Error) {
    try {
      Logger.logToServer(error, Globals.RendererLogLevel.Error).then(() =>
        Logger.log("Error logged to server: ", error)
      );
    } catch (e) {
      Logger.error(e);
    }

    this.setState({
      error,
    });
  }

  private renderErrorDisplay() {
    let title = "Error";
    let message = <p>{this.state.error.message}</p>;
    if (this.state.error instanceof DetailedError) {
      title = this.state.error.title;
      message = (
        <p dangerouslySetInnerHTML={{ __html: this.state.error.message }} />
      );
    }

    return (
      <div className={styles.errorWrapper}>
        <BungieHelmet
          title={Localizer.Errors.Error}
          image={BungieHelmet.DefaultBoringMetaImage}
        >
          <body className={SpecialBodyClasses(BodyClasses.NoSpacer)} />
        </BungieHelmet>
        <Grid>
          <GridCol cols={6} mobile={0}>
            &nbsp;
          </GridCol>
          <GridCol cols={6} mobile={12}>
            <h1>{title}</h1>
            {message}
          </GridCol>
        </Grid>
      </div>
    );
  }
}

export const BasicErrorBoundary = withRouter(BasicErrorBoundaryInner);
