import * as React from "react";
import styles from "./DestinyBuyProductSummary.module.scss";
import { Localizer } from "@Global/Localizer";
import {
  Button,
  ButtonTypes,
  ButtonProps,
} from "@UI/UIKit/Controls/Button/Button";
import classNames from "classnames";
import { Anchor } from "@UI/Navigation/Anchor";
import { RouteDefs } from "@Routes/RouteDefs";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { IDestinyBuyDetailRouteParams } from "../DestinyBuyDetail";
import { BuyButtonProps, BuyButton } from "@UI/UIKit/Controls/Button/BuyButton";
import { IDestinyProductDefinition } from "@UI/Destiny/SkuSelector/DestinyProductDefinitions";
import { IDestinySkuConfig } from "@UI/Destiny/SkuSelector/DestinySkuConfigDataStore";
import { DestinySkuUtils } from "@UI/Destiny/SkuSelector/DestinySkuUtils";
import { BasicSize } from "@UI/UIKit/UIKitUtils";

interface IDestinyBuyProductSummaryProps
  extends React.DOMAttributes<HTMLDivElement>,
    RouteComponentProps {
  className?: string;
  targeted?: boolean;
  definition: IDestinyProductDefinition;
  skuConfig: IDestinySkuConfig;
}

interface IDestinyBuyProductSummaryState {
  hovered: boolean;
}

/**
 * Renders one product in the Destiny Buy flow
 *  *
 * @param {IDestinyBuyProductSummaryProps} props
 * @returns
 */
class DestinyBuyProductSummary extends React.Component<
  IDestinyBuyProductSummaryProps,
  IDestinyBuyProductSummaryState
> {
  constructor(props: IDestinyBuyProductSummaryProps) {
    super(props);

    this.state = {
      hovered: false,
    };
  }

  private readonly showStoreModal = () => {
    DestinySkuUtils.showStoreModal(this.props.definition.skuTag);
  };

  private renderButton() {
    const { definition: def, targeted } = this.props;

    const buttonType: ButtonTypes = targeted || def.featured ? "gold" : "white";

    const size: BasicSize = targeted ? BasicSize.Large : BasicSize.Medium;

    const buttonProps: ButtonProps = {
      buttonType,
      className: styles.buyButton,
      onClick: this.showStoreModal,
      size,
      children: def.buttonLabel,
    };

    if (targeted) {
      (buttonProps as BuyButtonProps).sheen = 0.5;
    }

    return targeted || def.featured ? (
      <BuyButton {...buttonProps} analyticsId={def.skuTag} />
    ) : (
      <Button {...buttonProps} analyticsId={def.skuTag} />
    );
  }

  public render() {
    const {
      definition: def,
      className,
      skuConfig,
      targeted,
      history,
      location,
      match,
      staticContext,
      ...rest
    } = this.props;

    const classes = classNames(styles.product, className, {
      [styles.targeted]: this.props.targeted,
      [styles.featured]: this.props.definition.featured && !this.props.targeted,
      [styles.hover]: this.state.hovered,
    });

    const productStyle: React.CSSProperties = def.imagePath
      ? { backgroundImage: `url(${def.imagePath})` }
      : {};

    const stores = DestinySkuUtils.getStoresForProduct(
      def.skuTag,
      this.props.skuConfig
    );
    const productIsOnSale = DestinySkuUtils.isProductOnSale(
      def.skuTag,
      this.props.skuConfig
    );
    const showDisclaimer =
      def.disclaimer !== undefined && def.disclaimer !== "" && productIsOnSale;

    return (
      <div className={classes} {...rest}>
        <div className={styles.imageWrap}>
          {!targeted && productIsOnSale && (
            <DiscountLabel definition={def} showAsterisk={showDisclaimer} />
          )}
          <div className={styles.productImage} style={productStyle} />
        </div>

        <div className={styles.infoWrap}>
          <div className={styles.action}>
            {targeted && (
              <div className={styles.titleWrap}>
                <Title definition={def} />
                {productIsOnSale && def.discountText && (
                  <DiscountLabel
                    definition={def}
                    showAsterisk={showDisclaimer}
                  />
                )}
              </div>
            )}

            {this.renderButton()}
          </div>

          <div className={styles.detailWrap}>
            <div className={styles.details}>
              {!targeted && <Title definition={def} />}

              {stores.length > 1 && (
                <div className={styles.availability}>
                  <div className={styles.label}>
                    {Localizer.Buyflow.AvailableOn}
                  </div>
                  <div className={styles.storeAvail}>
                    {stores.map((store) =>
                      DestinySkuUtils.getSaleForProductAndStore(
                        def.skuTag,
                        store.key,
                        this.props.skuConfig
                      ) && def.discountText ? (
                        <span key={store.key} className={styles.onSale}>
                          {Localizer.SkuDestinations[store.stringKey + "Short"]}
                        </span>
                      ) : (
                        <span key={store.key}>
                          {Localizer.SkuDestinations[store.stringKey + "Short"]}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div
                className={styles.blurb}
                dangerouslySetInnerHTML={{ __html: def.blurb }}
              />
            </div>
            {showDisclaimer && (
              <div className={styles.disclaimer}>{`*${def.disclaimer}`}</div>
            )}
            {def.relatedPage && (
              <div className={styles.learnMore}>
                <Anchor url={def.relatedPage}>
                  {Localizer.Buyflow.LearnMoreLinkLabel}
                </Anchor>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DestinyBuyProductSummary);

const Title = (props: { definition: IDestinyProductDefinition }) => {
  const { definition } = props;

  return (
    <React.Fragment>
      <div className={styles.subtitle}>{definition.title}</div>
      <div className={styles.title}>{definition.subtitle}</div>
    </React.Fragment>
  );
};

export const DiscountLabel = (props: {
  definition: IDestinyProductDefinition;
  showAsterisk: boolean;
}) => {
  const { definition, showAsterisk } = props;
  const discountLabel = showAsterisk
    ? `${definition.discountText}*`
    : definition.discountText;

  return (
    <div className={styles.price}>
      {definition.discountText && (
        <span className={styles.discountText}>
          {/*<div className={styles.sheen} />*/}
          {discountLabel}
        </span>
      )}
    </div>
  );
};
