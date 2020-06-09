// Created by jlauer, 2019
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "./DestinySkuSelector.module.scss";
import { IDestinyProductDefinition } from "./DestinyProductDefinitions";
import DestinySkuConfigDataStore, {
  IDestinySkuConfig,
} from "./DestinySkuConfigDataStore";
import { Localizer } from "@Global/Localizer";
import { DestinySkuSelectorOptions } from "./DestinySkuSelectorOptions";
import { DestroyCallback } from "@Global/DataStore";
import { Platform } from "@Platform";
import { DestinySkuUtils } from "./DestinySkuUtils";
import { Spinner } from "@UI/UIKit/Controls/Spinner";
import { DiscountLabel } from "@Areas/Destiny/Buy/DestinyBuyProductSummary";

interface IDestinySkuSelectorProps {
  skuTag: string;
}

interface IDestinySkuSelectorState {
  skuConfig: IDestinySkuConfig;
  definition: IDestinyProductDefinition;
}

/**
 * DestinySkuSelector - Replace this description
 *  *
 * @param {IDestinySkuSelectorProps} props
 * @returns
 */
export default class DestinySkuSelector extends React.Component<
  IDestinySkuSelectorProps,
  IDestinySkuSelectorState
> {
  private destroyConfigMonitor: DestroyCallback;

  constructor(props: IDestinySkuSelectorProps) {
    super(props);

    this.state = {
      skuConfig: null,
      definition: null,
    };
  }

  public componentDidMount() {
    this.loadSkuConfig();
    this.loadSkuContent();
  }

  private loadSkuConfig() {
    this.destroyConfigMonitor = DestinySkuConfigDataStore.observe((skuConfig) =>
      this.setState({
        skuConfig,
      })
    );
  }

  private loadSkuContent() {
    const skuTag = this.props.skuTag;

    Platform.ContentService.GetContentByTagAndType(
      `sku-${skuTag}`,
      "DestinySkuItem",
      Localizer.CurrentCultureName,
      false
    ).then((contentItem) => {
      const definition = DestinySkuUtils.skuDefinitionFromContent(contentItem);

      this.setState({
        definition,
      });
    });
  }

  public render() {
    const { skuConfig, definition: def } = this.state;

    if (!skuConfig || !def) {
      return <Spinner />;
    }

    const productIsOnSale = DestinySkuUtils.isProductOnSale(
      this.props.skuTag,
      skuConfig
    );
    const showDisclaimer =
      def.disclaimer !== null && def.disclaimer !== "" && productIsOnSale;

    return (
      <div className={styles.buyModalContent}>
        {productIsOnSale && (
          <div className={styles.discountLabel}>
            <DiscountLabel definition={def} showAsterisk={showDisclaimer} />
          </div>
        )}
        <div className={styles.modalSkuImage}>
          <img src={def.imagePath} />
        </div>
        <div className={styles.storeOptions}>
          <div className={styles.modalTitle}>
            <span>
              {def.title}
              <br />
              {def.subtitle}
            </span>
          </div>
          <DestinySkuSelectorOptions
            definition={def}
            skuConfig={skuConfig}
            className={styles.selectorOptions}
          />
          {showDisclaimer && (
            <div className={styles.disclaimer}>{`*${def.disclaimer}`}</div>
          )}
        </div>
      </div>
    );
  }
}
