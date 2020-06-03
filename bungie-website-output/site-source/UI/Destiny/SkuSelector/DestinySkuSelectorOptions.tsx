// Created by jlauer, 2019
// Copyright Bungie, Inc.

import * as React from "react";
import { Localizer } from "@Global/Localizer";
import { Button } from "@UI/UIKit/Controls/Button/Button";
import { Dropdown, IDropdownOption } from "@UI/UIKit/Forms/Dropdown";
import DestinySkuStoreButton from "./DestinySkuStoreButton";
import {
  IDestinySkuStore,
  IDestinySkuValidRegion,
  IDestinySkuConfig,
} from "./DestinySkuConfigDataStore";
import { DetailedError } from "@CustomErrors";
import { IDestinyProductDefinition } from "./DestinyProductDefinitions";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styles from "./DestinySkuSelectorOptions.module.scss";
import classNames from "classnames";
import { DestinySkuUtils } from "./DestinySkuUtils";
import moment from "moment/moment";

// Required props
interface IDestinySkuSelectorOptionsProps extends RouteComponentProps {
  definition: IDestinyProductDefinition;
  skuConfig: IDestinySkuConfig;
  className?: string;
}

// Default props - these will have values set in DestinySkuSelectorOptions.defaultProps
interface DefaultProps {}

type Props = IDestinySkuSelectorOptionsProps & DefaultProps;

interface IDestinySkuSelectorOptionsState {
  selectedStore: IDestinySkuStore;
  selectedRegion: string;
}

/**
 * DestinySkuSelectorOptions - Replace this description
 *  *
 * @param {IDestinySkuSelectorOptionsProps} props
 * @returns
 */
class DestinySkuSelectorOptionsInternal extends React.Component<
  Props,
  IDestinySkuSelectorOptionsState
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStore: null,
      selectedRegion: "",
    };
  }

  public static defaultProps: DefaultProps = {};

  private getRegionOptionsForStore(
    store: IDestinySkuStore
  ): IDropdownOption<IDestinySkuValidRegion>[] {
    const { definition: def, skuConfig } = this.props;

    const storeDef = skuConfig.stores.find((s) => s.key === store.key);
    if (!storeDef) {
      throw new DetailedError(
        "Store Invalid",
        `Store of name ${store.key} does not exist in configuration.`
      );
    }

    const regions = DestinySkuUtils.getRegionsForProduct(
      def.skuTag,
      store.key,
      skuConfig
    );

    const options = regions.map((r) => {
      const validRegion = storeDef.validRegions.find((a) => a.key === r.key);
      if (!storeDef) {
        throw new DetailedError(
          "Region Invalid",
          `Region of name ${r.key} does not exist in configuration.`
        );
      }

      return {
        label: Localizer.SkuDestinations[validRegion.stringKey],
        value: r.key,
        metadata: validRegion,
      } as IDropdownOption<IDestinySkuValidRegion>;
    });

    options.unshift({
      label: Localizer.Skudestinations.SelectYourRegion,
      value: "",
      metadata: null,
    });

    return options;
  }

  private readonly onStoreSelected = (
    e: React.MouseEvent<HTMLElement>,
    selectedStore: IDestinySkuStore
  ) => {
    const buttonUrl = (e.target as HTMLAnchorElement).href;
    if (buttonUrl) {
      DestinySkuUtils.triggerConversion(
        this.props.definition.skuTag,
        selectedStore.key,
        DestinySkuUtils.REGION_GLOBAL_KEY,
        this.props
      );
    } else {
      this.setState({
        selectedStore,
      });
    }
  };

  private readonly getSaleDateString = (activeSale) => {
    const ed = moment(
      moment(activeSale.endDate).local(true),
      "YYYY-MM-DD HH:mm"
    );
    const saleDescription = Localizer.Buyflow.GenericSaleDescription;
    const endDateTime = Localizer.Format(Localizer.Time.HourMinuteAmpm, {
      hour12: ed.format("hh"),
      minute: ed.format("mm"),
      ampm: ed.format("A"),
    });
    const endDateString = Localizer.Format(Localizer.Time.CompactMonthDayYear, {
      month: ed.format("MM"),
      day: ed.format("DD"),
      year: ed.format("YYYY"),
    });
    const activeSaleString = Localizer.Format(Localizer.Buyflow.SaleEndsOn, {
      saleDescription: saleDescription,
      endDate: endDateString,
    });

    return activeSaleString;
  };

  private readonly onDropdownChanged = (value: string) => {
    this.setState({
      selectedRegion: value,
    });
  };

  public render() {
    const { definition: def, className } = this.props;

    const stores = DestinySkuUtils.getStoresForProduct(
      def.skuTag,
      this.props.skuConfig
    );

    const subtitle = Localizer.Format(Localizer.Buyflow.ChooseAPlatformToOpen, {
      productName: def.title,
    });

    const outerClasses = classNames(styles.options, className);

    return (
      <div className={outerClasses}>
        {!this.state.selectedStore && (
          <React.Fragment>
            <div className={styles.modalSubtitle}>{subtitle}</div>
            <div className={styles.modalButtons}>
              {stores.map((store) => {
                const url = DestinySkuUtils.tryGetGlobalRegionUrl(
                  def.skuTag,
                  store.key,
                  this.props.skuConfig
                );
                const activeSale =
                  DestinySkuUtils.getSaleForProductAndStore(
                    def.skuTag,
                    store.key,
                    this.props.skuConfig
                  ) || null;
                let activeSaleString = "";

                if (activeSale) {
                  activeSaleString = this.getSaleDateString(activeSale);

                  if (def.disclaimer) {
                    activeSaleString += "*";
                  }
                }

                return (
                  <div
                    key={store.key}
                    className={classNames(styles.buttonContainer, {
                      [styles.activeSale]: activeSale,
                    })}
                  >
                    <Button
                      buttonType={"white"}
                      className={styles.storeButton}
                      url={url}
                      sameTab={false}
                      onClick={(e) => this.onStoreSelected(e, store)}
                      analyticsId={`${store}|${def.skuTag}`}
                    >
                      {Localizer.SkuDestinations[store.stringKey]}
                    </Button>
                    {activeSale && def.discountText && (
                      <p className={styles.endDate}>{activeSaleString}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {this.state.selectedStore && (
          <React.Fragment>
            <Button disabled={true} className={styles.selectedStore}>
              {this.state.selectedStore.key}
            </Button>
            <span
              className={styles.changeStore}
              onClick={() => {
                this.setState({ selectedStore: null });
              }}
            >
              {Localizer.Buyflow.change}
            </span>
            <div className={styles.regionSelect}>
              <p>{Localizer.Buyflow.chooseyourregion}</p>
              <Dropdown
                className={styles.regionDropdown}
                options={this.getRegionOptionsForStore(
                  this.state.selectedStore
                )}
                onChange={this.onDropdownChanged}
              />
            </div>
            {this.state.selectedRegion !== "" && (
              <div>
                <DestinySkuStoreButton
                  store={this.state.selectedStore.key}
                  sku={def.skuTag}
                  region={this.state.selectedRegion}
                  config={this.props.skuConfig}
                  disabled={this.state.selectedRegion === ""}
                >
                  {def.buttonLabel}
                </DestinySkuStoreButton>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export const DestinySkuSelectorOptions = withRouter(
  DestinySkuSelectorOptionsInternal
);
