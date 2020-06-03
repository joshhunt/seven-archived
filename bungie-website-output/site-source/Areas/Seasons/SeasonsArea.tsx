import { RouteComponentProps, Route, Redirect } from "react-router-dom";
import React from "react";
import { WithRouteData } from "@UI/Navigation/WithRouteData";
import { RouteDefs } from "@Routes/RouteDefs";
import { NotFoundError } from "@CustomErrors";
import EventsRouter from "./Events/EventsRouter";
import SeasonsProgress from "./SeasonsProgress";
import PreviousSeason from "./PreviousSeason";
import { SwitchWithErrors } from "@UI/Navigation/SwitchWithErrors";
import SeasonOfDawn from "./ProductPages/Season9/SeasonOfDawn";
import { SeasonOfTheUndying } from "./ProductPages/Season8/SeasonOfTheUndying";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import SeasonOfTheWorthy from "./ProductPages/Season10/SeasonOfTheWorthy";
import { SeasonsDefinitions } from "./SeasonsDefinitions";

class SeasonsArea extends React.Component<RouteComponentProps> {
  public render() {
    const systemEnabled = ConfigUtils.SystemStatus("CoreAreaSeasons");

    if (!systemEnabled) {
      throw new NotFoundError();
    }

    const currentSeasonAction = RouteDefs.Areas.Seasons.getAction(
      SeasonsDefinitions.currentSeason.actionRouteString
    );

    return (
      <SwitchWithErrors>
        <Route
          path={RouteDefs.Areas.Seasons.getAction("Events").path}
          component={EventsRouter}
        />
        <Route
          path={RouteDefs.Areas.Seasons.getAction("PreviousSeason").path}
          component={PreviousSeason}
        />
        <Route
          path={RouteDefs.Areas.Seasons.getAction("SeasonOfTheUndying").path}
          component={SeasonOfTheUndying}
        />
        <Route
          path={RouteDefs.Areas.Seasons.getAction("SeasonOfDawn").path}
          component={SeasonOfDawn}
        />
        <Route
          path={RouteDefs.Areas.Seasons.getAction("SeasonOfTheWorthy").path}
          component={SeasonOfTheWorthy}
        />
        <Route
          path={RouteDefs.Areas.Seasons.getAction("Progress").path}
          component={SeasonsProgress}
        />
        <Route
          exact={true}
          path={RouteDefs.Areas.Seasons.getAction("Index").path}
        >
          <Redirect push={false} to={currentSeasonAction.resolve().url} />
        </Route>
      </SwitchWithErrors>
    );
  }
}

export default WithRouteData(SeasonsArea);
