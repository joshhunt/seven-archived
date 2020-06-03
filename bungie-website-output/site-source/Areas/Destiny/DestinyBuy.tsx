import * as React from "react";
import styles from "./DestinyBuy.module.scss";
import { Grid, GridCol } from "@UI/UIKit/Layout/Grid/Grid";
import { RouteComponentProps, Redirect } from "react-router-dom";
import { Platform, Content, Renderer, Responses } from "@Platform";
import { Localizer } from "@Global/Localizer";
import { BungieHelmet } from "@UI/Routing/BungieHelmet";
import { DestroyCallback } from "@Global/DataStore";
import DestinyBuyProductSummary from "./Buy/DestinyBuyProductSummary";
import {
  SpinnerContainer,
  SpinnerDisplayMode,
} from "@UI/UIKit/Controls/Spinner";
import { DestinyHeader } from "@UI/Destiny/DestinyHeader";
import {
  withGlobalState,
  GlobalStateComponentProps,
} from "@Global/DataStore/GlobalStateDataStore";
import { SystemNames } from "@Global/SystemNames";
import DestinySkuConfigDataStore, {
  IDestinySkuConfig,
} from "@UI/Destiny/SkuSelector/DestinySkuConfigDataStore";
import {
  SkuSectionNames,
  IDestinyProductDefinition,
  skuSectionNameToKeyMapping,
} from "@UI/Destiny/SkuSelector/DestinyProductDefinitions";
import { DestinySkuUtils } from "@UI/Destiny/SkuSelector/DestinySkuUtils";
import { DestinySkuTags } from "@UI/Destiny/SkuSelector/DestinySkuConstants";
import { Button } from "@UI/UIKit/Controls/Button/Button";
import { BasicSize } from "@UI/UIKit/UIKitUtils";
import moment from "moment/moment";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { UserUtils } from "@Utilities/UserUtils";
import { EnumUtils } from "@Utilities/EnumUtils";
import { DestinyGameVersions } from "@Enum";
import { EnumStrings } from "@Utilities/EnumerableUtils";
import { StringUtils, StringCompareOptions } from "@Utilities/StringUtils";
import { SpecialBodyClasses, BodyClasses } from "@UI/HelmetUtils";

interface IDestinyBuyProps
  extends RouteComponentProps<IDestinyBuyRouteParams>,
    GlobalStateComponentProps<"loggedInUser"> {}

interface IDestinyBuyState {
  title: string;
  skuItems: IDestinyProductDefinition[];
  skuConfig: IDestinySkuConfig;
  loading: boolean;
  entitlements: Renderer.Destiny2Entitlements;
}

export interface IDestinyBuyRouteParams {
  version?: string;
  /** If version is "All", this item is the 'featured' item */
  target?: SkuSectionNames;
}

type Ownership = { [K in keyof typeof DestinyGameVersions]: boolean };

/**
 * The Destiny Buy flow page
 *  *
 * @param {IDestinyBuyProps} props
 * @returns
 */
class DestinyBuyInternal extends React.Component<
  IDestinyBuyProps,
  IDestinyBuyState
> {
  private destroyConfigMonitor: DestroyCallback;

  constructor(props: IDestinyBuyProps) {
    super(props);

    this.state = {
      title: "",
      skuItems: [],
      skuConfig: DestinySkuConfigDataStore.state,
      loading: true,
      entitlements: null,
    };
  }

  private get isPromotion() {
    return this.props.match.params.version?.toLowerCase() === "promo";
  }

  /** Determine which product should be the target */
  private getTargetProduct() {
    // Default to the product defined in Webmaster and fall back to F2P
    let target = ConfigUtils.GetParameter(
      SystemNames.CoreDestinyBuy,
      "DefaultTargetProduct",
      DestinySkuTags.NewLightDetail
    );

    if (!this.isPromotion) {
      // If the URL specifies one, use that
      if (this.props.match.params.target) {
        target = this.props.match.params.target;
      }
      // If the user is logged in and has entitlements, use those to determine which product to show
      else if (
        this.state.entitlements &&
        this.state.entitlements.Entitlements &&
        this.state.entitlements.Entitlements.platformEntitlements
      ) {
        const entitlementWrapper = this.state.entitlements.Entitlements
          .platformEntitlements;

        // Get the owned game versions as an array
        const gameVersionValues = Object.values(entitlementWrapper).map(
          (data) => data.gameVersions
        );

        if (gameVersionValues.length > 0) {
          // Reduce the owned versions to a single flag value. We don't care which platform they own a product on, because if they own it, they know about it
          const allEntitlements = gameVersionValues.reduce((all, flag) => {
            return all | flag;
          });

          // Get a list of the game versions as string keys)
          const ownershipKeyStrings = EnumUtils.getStringKeys(
            DestinyGameVersions
          ) as EnumStrings<typeof DestinyGameVersions>[];

          // Reduce the ownership keys to an object with the key being the game version and the value being a boolean (determined from the flags)
          const ownership = ownershipKeyStrings.reduce(
            (all, thisKey) => ({
              ...all,
              [thisKey]: EnumUtils.hasFlag(
                DestinyGameVersions[thisKey],
                allEntitlements
              ),
            }),
            {} as Ownership
          );

          if (ownership.Destiny2) {
            if (!ownership.Shadowkeep) {
              target = DestinySkuTags.ShadowkeepStandard;
            } else if (!ownership.Forsaken) {
              target = DestinySkuTags.ForsakenDetail;
            }
          }
        }
      }
    }

    return target;
  }

  public componentDidMount() {
    this.destroyConfigMonitor = DestinySkuConfigDataStore.observe((skuConfig) =>
      this.setState(
        {
          skuConfig,
        },
        this.onSkuConfigLoaded
      )
    );

    if (UserUtils.isAuthenticated(this.props.globalState)) {
      Platform.RendererService.Destiny2Entitlements().then((entitlements) =>
        this.setState({ entitlements })
      );
    }
  }

  public componentWillUnmount() {
    this.destroyConfigMonitor && this.destroyConfigMonitor();
  }

  private readonly onSkuConfigLoaded = () => {
    if (this.state.skuConfig.loaded) {
      const section = this.state.skuConfig.sections.find(
        (a) => a.key === "Destiny"
      );

      // Load the Firehose content item for the specified tag
      this.loadSkuContent(section.firehoseContentSetTag);
    }
  };

  private loadSkuContent(firehoseContentSetTag: string) {
    Platform.ContentService.GetContentByTagAndType(
      firehoseContentSetTag,
      "ContentSet",
      Localizer.CurrentCultureName,
      false
    )
      .then((contentSet) => {
        const title = contentSet.properties["Title"];
        const allItems: Content.ContentItemPublicContract[] =
          contentSet.properties["ContentItems"];
        if (allItems) {
          const skuItems: IDestinyProductDefinition[] = allItems
            .filter((a) => a.cType === "DestinySkuItem")
            .map((contentItem) =>
              DestinySkuUtils.skuDefinitionFromContent(contentItem)
            )
            .filter((skuItem) =>
              DestinySkuUtils.productExists(
                skuItem.skuTag,
                this.state.skuConfig
              )
            );

          this.setState({
            title,
            skuItems,
          });
        }
      })
      .finally(() =>
        this.setState({
          loading: false,
        })
      );
  }

  public render() {
    if (this.state.skuItems.length === 0) {
      return (
        <SpinnerContainer loading={true} mode={SpinnerDisplayMode.fullPage} />
      );
    }

    const allSkus = this.state.skuItems;
    const target = this.getTargetProduct();
    const skus = allSkus.filter(
      (a) =>
        !StringUtils.equals(a.skuTag, target, StringCompareOptions.IgnoreCase)
    );
    const featuredSku = allSkus.find((a) =>
      StringUtils.equals(a.skuTag, target, StringCompareOptions.IgnoreCase)
    );
    const stadiaStartDate = ConfigUtils.GetParameter(
      "StadiaLimited",
      "StadiaReleaseDate",
      ""
    );
    const stadiaIsLive = moment().isAfter(moment(stadiaStartDate));

    const metaImage = skus.length > 0 ? skus[0].imagePath : null;

    return (
      <React.Fragment>
        <BungieHelmet image={metaImage} title={this.state.title}>
          <body className={SpecialBodyClasses(BodyClasses.HideServiceAlert)} />
        </BungieHelmet>
        <Grid isTextContainer={true}>
          {featuredSku && !this.isPromotion && (
            <GridCol cols={12}>
              <DestinyBuyProductSummary
                targeted
                key={featuredSku.skuTag}
                className={styles.product}
                definition={featuredSku}
                skuConfig={this.state.skuConfig}
              />
            </GridCol>
          )}
          <GridCol cols={12}>
            <DestinyHeader
              separator="//"
              breadcrumbs={[
                Localizer.Buyflow.ProductHeaderBreadcrumb,
                this.state.title,
              ]}
              title={this.state.title}
            />
          </GridCol>
          <GridCol cols={12}>
            <SpinnerContainer
              delayRenderUntilLoaded={true}
              loading={this.state.loading}
            >
              <div className={styles.productList}>
                {skus.length === 0 && (
                  <h3>{Localizer.Buyflow.NoProductsFound}</h3>
                )}
                {skus.map((def) => (
                  <DestinyBuyProductSummary
                    key={def.skuTag}
                    className={styles.product}
                    definition={def}
                    skuConfig={this.state.skuConfig}
                  />
                ))}
              </div>
            </SpinnerContainer>
          </GridCol>
        </Grid>
        {!this.isPromotion && stadiaIsLive && (
          <Grid isTextContainer={true}>
            <GridCol cols={12} className={styles.stadia}>
              <div className={styles.title}>
                {Localizer.Buyflow.StadiaTitle}
              </div>
              <Button
                buttonType="gold"
                size={BasicSize.Medium}
                url={"https://store.google.com/product/stadia_learn"}
                caps={true}
              >
                {Localizer.Buyflow.LearnMoreStadia}
              </Button>
            </GridCol>
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

export const DestinyBuy = withGlobalState(DestinyBuyInternal, ["loggedInUser"]);
