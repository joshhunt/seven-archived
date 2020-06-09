import { RouteComponentProps, Route, withRouter } from "react-router-dom";
import React from "react";
import { RouteDefs } from "@Routes/RouteDefs";
import { AnimatedRouter } from "@UI/Routing/AnimatedRouter";
import { DirectVideo } from "./DirectVideo";

interface IDirectRouterProps {}

class DirectArea extends React.Component<IDirectRouterProps> {
  public render() {
    return (
      <React.Fragment>
        <AnimatedRouter>
          <Route
            path={RouteDefs.Areas.Direct.getAction("Video").path}
            component={DirectVideo}
          />
        </AnimatedRouter>
      </React.Fragment>
    );
  }
}

export default DirectArea;
