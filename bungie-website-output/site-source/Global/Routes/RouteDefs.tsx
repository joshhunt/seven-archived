/* tslint:disable member-ordering */
import { ActionRoute } from "./ActionRoute";
import { Area } from "./Area";
import React from "react";
import {
  SpinnerContainer,
  SpinnerDisplayMode,
} from "@UI/UIKit/Controls/Spinner";
import { SystemNames } from "@Global/SystemNames";
import { Logger } from "@Global/Logger";
import { FullPageLoadingBar } from "@UI/UIKit/Controls/FullPageLoadingBar";
import { AppLoadingDataStore } from "@Global/DataStore/AppLoadingDataStore";
import { ConfigUtils } from "@Utilities/ConfigUtils";

export interface ILocaleParams {
  locale?: string;
}

export class RouteDefs {
  private static readonly AreaNames = {
    Codes: "Codes",
    CrossSave: "CrossSave",
    Destiny: "Destiny",
    Direct: "Direct",
    Legal: "Legal",
    PCMigration: "PCMove",
    UserResearch: "UserResearch",
    Seasons: "Seasons",
    Static: "Static",
    Registration: "Registration",
  };

  public static Areas = {
    CrossSave: new Area({
      name: RouteDefs.AreaNames.CrossSave,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import(
          "@Areas/CrossSave/CrossSaveArea" /* webpackChunkName: "CrossSave" */
        )
      ),
      routes: [
        (area) => new ActionRoute(area, "index"),
        (area) =>
          new ActionRoute(area, "Activate", { path: ":step?/:skuName?" }),
        (area) => new ActionRoute(area, "Confirmation"),
        (area) => new ActionRoute(area, "Deactivate"),
        (area) => new ActionRoute(area, "Recap"),
      ],
    }),
    Codes: new Area({
      name: RouteDefs.AreaNames.Codes,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Codes/CodesArea" /* webpackChunkName: "Codes" */)
      ),
      routes: [
        (area) => new ActionRoute(area, "Redeem"),
        (area) => new ActionRoute(area, "History", { path: ":membershipId?" }),
        (area) => new ActionRoute(area, "Partners", { path: ":membershipId?" }),
      ],
    }),
    Destiny: new Area({
      name: RouteDefs.AreaNames.Destiny,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Destiny/DestinyArea" /* webpackChunkName: "Destiny" */)
      ),
      routes: [
        (area) => new ActionRoute(area, "index"),
        (area) => new ActionRoute(area, "ProductPage"),
        (area) => new ActionRoute(area, "Buy", { path: ":version?/:target?" }),
        (area) =>
          new ActionRoute(area, "BuyDetail", {
            path: "Buy/Detail/:skuName",
            isOverride: true,
          }),
        (area) => new ActionRoute(area, "NewLight"),
        (area) => new ActionRoute(area, "Forsaken"),
        (area) => new ActionRoute(area, "Shadowkeep"),
        (area) => new ActionRoute(area, "SeasonPass"),
        (area) => new ActionRoute(area, "PcRegister"),
        (area) => new ActionRoute(area, "StadiaRegister"),
        (area) => new ActionRoute(area, "Info", { path: ":eventTag" }),
        (area) => new ActionRoute(area, "Reveal"),
      ],
    }),
    Direct: new Area({
      name: RouteDefs.AreaNames.Direct,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Direct/DirectArea")
      ),
      routes: [
        (area) => new ActionRoute(area, "Video", { path: ":videoContentId" }),
      ],
    }),
    Legal: new Area({
      name: RouteDefs.AreaNames.Legal,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Legal/LegalArea" /* webpackChunkName: "Legal" */)
      ),
      routes: [
        (area) => new ActionRoute(area, "Terms"),
        (area) => new ActionRoute(area, "PrivacyPolicy"),
        (area) => new ActionRoute(area, "Licenses"),
        (area) => new ActionRoute(area, "SLA"),
        (area) => new ActionRoute(area, "CodeOfConduct"),
        (area) => new ActionRoute(area, "CookiePolicy"),
      ],
    }),
    PCMigration: new Area({
      name: RouteDefs.AreaNames.PCMigration,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import(
          "@Areas/PCMigration/PCMigrationArea" /* webpackChunkName: "PCMigration" */
        )
      ),
      routes: [(area) => new ActionRoute(area, "index")],
    }),
    Seasons: new Area({
      name: RouteDefs.AreaNames.Seasons,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Seasons/SeasonsArea" /* webpackChunkName: "Seasons" */)
      ),
      routes: [
        (area) => new ActionRoute(area, "index"),
        (area) => new ActionRoute(area, "SeasonOfTheUndying"),
        (area) => new ActionRoute(area, "SeasonOfDawn"),
        (area) => new ActionRoute(area, "SeasonOfTheWorthy"),
        (area) => new ActionRoute(area, "Progress"),
        (area) => new ActionRoute(area, "PreviousSeason"),
        (area) => new ActionRoute(area, "Events", { path: ":eventTag" }),
      ],
      webmasterSystem: SystemNames.CoreAreaSeasons,
    }),
    UserResearch: new Area({
      name: RouteDefs.AreaNames.UserResearch,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import(
          "@Areas/UserResearch/UserResearchArea" /* webpackChunkName: "UserResearch" */
        )
      ),
      routes: [
        (area) => new ActionRoute(area, "index"),
        (area) => new ActionRoute(area, "UserResearch"),
        (area) => new ActionRoute(area, "UserResearchCanTravel"),
      ],
    }),
    Static: new Area({
      name: RouteDefs.AreaNames.Static,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import("@Areas/Static/StaticArea" /* webpackChunkName: "Static" */)
      ),
      indexParams: { path: ":page?" },
      routes: [],
    }),
    Registration: new Area({
      name: RouteDefs.AreaNames.Registration,
      lazyComponent: RouteDefs.createAsyncComponent(() =>
        import(
          "@Areas/Registration/RegistrationArea" /* webpackChunkName: "Registration" */
        )
      ),
      routes: [
        (area) => new ActionRoute(area, "index"),
        (area) => new ActionRoute(area, "RegistrationPage"),
        (area) => new ActionRoute(area, "Benefits"),
      ],
    }),
  };

  /**
   * Returns all of the routes for all areas defined in RouteDefs
   */
  public static get AllAreaRoutes() {
    const allAreas: Area[] = Object.keys(RouteDefs.Areas)
      .map((key) => RouteDefs.Areas[key])
      .filter((area: Area) => {
        let enabled = true;
        if (area.params && area.params.webmasterSystem) {
          enabled = ConfigUtils.SystemStatus(area.params.webmasterSystem);
        }

        return enabled;
      });

    const areaRoutes = allAreas.map((area) => area.areaRoute);

    return areaRoutes;
  }

  public static createAsyncComponent(
    componentPromise: () => Promise<{ default: React.ComponentType<any> }>
  ) {
    const LazyComponent = React.lazy(() => this.retry(componentPromise));

    return (props) => (
      <React.Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  }

  // An attempt at fixing chunk load failures
  // https://dev.to/goenning/how-to-retry-when-react-lazy-fails-mb5
  private static retry(
    fn,
    retriesLeft = 5,
    interval = 500
  ): Promise<{ default: React.ComponentType<any> }> {
    return new Promise((resolve, reject) => {
      fn()
        .then(resolve)
        .catch((error) => {
          setTimeout(() => {
            if (retriesLeft === 1) {
              reject(error);

              return;
            }

            // Passing on "reject" is the important part
            this.retry(fn, retriesLeft - 1, interval).then(resolve, reject);
          }, interval);
        });
    });
  }
}

class LoadingFallback extends React.PureComponent {
  public componentDidMount() {
    AppLoadingDataStore.update({ loading: true });
  }

  public componentWillUnmount() {
    AppLoadingDataStore.update({ loading: false });
  }

  public render() {
    return <FullPageLoadingBar loading={true} />;
  }
}
