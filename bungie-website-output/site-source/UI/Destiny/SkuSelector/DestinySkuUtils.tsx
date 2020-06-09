import { IDestinyProductDefinition } from "./DestinyProductDefinitions";
import { Content, Platform } from "@Platform";
import {
  IDestinySkuConfig,
  IDestinySkuProduct,
  IDestinySkuProductStore,
} from "./DestinySkuConfigDataStore";
import { DetailedError } from "@CustomErrors";
import { RouteHelper, IMultiSiteLink } from "@Routes/RouteHelper";
import { RouteComponentProps } from "react-router";
import { GlobalStateDataStore } from "@Global/DataStore/GlobalStateDataStore";
import DestinySkuSelectorModal from "./DestinySkuSelectorModal";
import { UserUtils, CookieConsentValidity } from "@Utilities/UserUtils";
import { AnalyticsUtils } from "@Utilities/AnalyticsUtils";
import { UrlUtils } from "@Utilities/UrlUtils";

export class DestinySkuUtils {
  public static REGION_GLOBAL_KEY = "GLOBAL";

  public static readonly showStoreModal = (skuTag: string) => {
    return DestinySkuSelectorModal.show({
      skuTag,
    });
  };

  private static getAllProducts(skuConfig: IDestinySkuConfig) {
    const productGroupProducts = skuConfig.productGroups.map((a) => [
      ...a.products,
    ]);
    const allProducts: IDestinySkuProduct[] = [].concat.apply(
      [],
      productGroupProducts
    );

    return allProducts;
  }

  public static skuDefinitionFromContent(
    contentItem: Content.ContentItemPublicContract
  ): IDestinyProductDefinition {
    const sku = contentItem.tags
      .find((a) => a.toLowerCase().startsWith("sku-"))
      .toLowerCase()
      .replace("sku-", "");

    return {
      title: contentItem.properties["ProductTitle"],
      subtitle: contentItem.properties["ProductEdition"],
      buttonLabel: contentItem.properties["ButtonLabel"],
      blurb: contentItem.properties["Blurb"],
      bigblurb: contentItem.properties["BigBlurb"],
      featured: contentItem.properties["Featured"] === "true",
      imagePath: contentItem.properties["Image"],
      price: contentItem.properties["Price"],
      discountText: contentItem.properties["DiscountLabel"],
      disclaimer: contentItem.properties["Disclaimer"],
      finalPrice: contentItem.properties["BungieStoreDiscountFinalPrice"],
      relatedPage: contentItem.properties["LearnMoreUrl"],
      skuTag: sku,
    };
  }

  public static productExists(skuTag: string, skuConfig: IDestinySkuConfig) {
    if (!skuConfig.loaded) {
      return false;
    }

    const allProducts = DestinySkuUtils.getAllProducts(skuConfig);
    const product = allProducts.find((p) => p.key === skuTag);

    return !!product;
  }

  public static getProduct(skuTag: string, skuConfig: IDestinySkuConfig) {
    if (!skuConfig.loaded) {
      return null;
    }

    const allProducts = DestinySkuUtils.getAllProducts(skuConfig);
    const product = allProducts.find((p) => p.key === skuTag);
    if (!product) {
      throw new DetailedError(
        "Product Invalid",
        `Product with key ${skuTag} does not exist in configuration.`
      );
    }

    return product;
  }

  public static getStoresForProduct(
    skuTag: string,
    skuConfig: IDestinySkuConfig
  ) {
    const product = DestinySkuUtils.getProduct(skuTag, skuConfig);
    if (!product) {
      return [];
    }

    return product.stores.map((ps) =>
      skuConfig.stores.find((s) => s.key === ps.key)
    );
  }

  public static getRegionsForProduct(
    skuTag: string,
    storeKey: string,
    skuConfig: IDestinySkuConfig
  ) {
    const product = DestinySkuUtils.getProduct(skuTag, skuConfig);
    if (!product) {
      return [];
    }

    const store = product.stores.find((s) => s.key === storeKey);
    if (!store) {
      throw new DetailedError(
        "Store Invalid",
        `Store with key ${storeKey} does not exist in configuration.`
      );
    }

    return store.regions;
  }

  public static isProductOnSale(skuTag: string, skuConfig: IDestinySkuConfig) {
    const product = DestinySkuUtils.getProduct(skuTag, skuConfig);
    if (!product) {
      return false;
    }

    return product.stores.some((ps) => ps.activeSale !== null);
  }

  public static getSaleForProductAndStore(
    skuTag: string,
    storeKey: string,
    skuConfig: IDestinySkuConfig
  ) {
    const product = DestinySkuUtils.getProduct(skuTag, skuConfig);
    if (!product) {
      return null;
    }

    const store = product.stores.find((ps) => ps.key === storeKey);

    return store.activeSale;
  }

  /**
   * Returns the URL for a store if it uses the global region. If not, return null.
   * @param sku The sku in question
   * @param store The store in question
   * @param config The sku config
   */
  public static tryGetGlobalRegionUrl(
    sku: string,
    store: string,
    config: IDestinySkuConfig
  ): IMultiSiteLink {
    let url: IMultiSiteLink = null;

    const regions = DestinySkuUtils.getRegionsForProduct(sku, store, config);

    if (
      regions.length <= 1 &&
      regions[0].key === DestinySkuUtils.REGION_GLOBAL_KEY
    ) {
      url = RouteHelper.Sku(sku, store, regions[0].key);
    }

    return url;
  }

  public static readonly triggerConversion = (
    sku: string,
    store: string,
    region: string,
    rcp: RouteComponentProps
  ) => {
    const q = location.search;
    const qObj = UrlUtils.QueryToObject(q);

    const newObj = {
      ...qObj,
      cvt: true,
      sku,
      store,
      region,
    };

    const newQuery = UrlUtils.ObjectToQuery(newObj);

    // Trigger the conversion URL
    rcp.history.replace({
      pathname: rcp.location.pathname,
      search: newQuery,
    });

    // Go back to the non-conversion URL to avoid accidentally tracking conversions when they aren't real
    rcp.history.replace({
      pathname: rcp.location.pathname,
      search: null,
    });

    if (
      UserUtils.isAuthenticated(GlobalStateDataStore.state) &&
      UserUtils.CookieConsentIsEnabled() &&
      UserUtils.CookieConsentIsCurrent()
    ) {
      Platform.ActivityService.LogProductBuyButtonActivity(sku, store, region);
    }
  };
}
