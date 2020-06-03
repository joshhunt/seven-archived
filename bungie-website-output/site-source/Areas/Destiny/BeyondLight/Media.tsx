// Created by atseng, 2020
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "./BeyondLightMedia.module.scss";
import { BungieHelmet } from "@UI/Routing/BungieHelmet";
import { SpecialBodyClasses, BodyClasses } from "@UI/HelmetUtils";
import { BeyondLightMainNav } from "./BeyondLightMainNav";
import { DestinyNewsAndMedia } from "../Shared/DestinyNewsAndMedia";
import { Img } from "@Helpers";
import { Localizer } from "@Global/Localizer";
import { RouteComponentProps } from "react-router-dom";
import { ConfigUtils } from "@Utilities/ConfigUtils";
import { SystemNames } from "@Global/SystemNames";

// Required props
interface IBeyondLightMediaProps extends RouteComponentProps {}

// Default props - these will have values set in BeyondLightMedia.defaultProps
interface DefaultProps {}

export type BeyondLightMediaProps = IBeyondLightMediaProps & DefaultProps;

interface IBeyondLightMediaState {}

/**
 * Media - Replace this description
 *  *
 * @param {IMediaProps} props
 * @returns
 */
export default class Media extends React.Component<
  IBeyondLightMediaProps,
  IBeyondLightMediaState
> {
  private readonly revealVideoId = ConfigUtils.GetParameter(
    SystemNames.BeyondLightRevealYoutube,
    Localizer.CurrentCultureName,
    ""
  );
  private readonly gameplayVideoId = ConfigUtils.GetParameter(
    SystemNames.BeyondLightGamePlayYoutube,
    Localizer.CurrentCultureName,
    ""
  );
  private readonly revealStreamVideoId = ConfigUtils.GetParameter(
    SystemNames.BeyondLightRevealStreamYoutube,
    Localizer.CurrentCultureName,
    ""
  );

  constructor(props: IBeyondLightMediaProps) {
    super(props);

    this.state = {};
  }

  public static defaultProps: DefaultProps = {};

  public render() {
    const beyondlightLoc = Localizer.Beyondlight;

    return (
      <React.Fragment>
        <BungieHelmet
          title={beyondlightLoc.BeyondLight}
          description={beyondlightLoc.gobeyondDesc}
          image={
            "/7/ca/destiny/products/beyondlight/bungie_net_metadata_beyondlight_1920x1080.jpg"
          }
        >
          <body
            className={SpecialBodyClasses(
              BodyClasses.HideServiceAlert |
                BodyClasses.NoSpacer |
                BodyClasses.HideMainNav
            )}
          />
        </BungieHelmet>
        <BeyondLightMainNav page={"media"} history={this.props.history} />
        <div className={styles.mediaContainer}>
          <DestinyNewsAndMedia
            showNews={false}
            showAll={true}
            videos={[
              {
                isVideo: true,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_trailer_1_thumbnail.jpg"
                ),
                detail: this.revealVideoId,
                title: beyondlightLoc.BeyondLightTeaserTrailer,
              },
              {
                isVideo: true,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_trailer_2_thumbnail.jpg"
                ),
                detail: this.gameplayVideoId,
                title: beyondlightLoc.BeyondLightGameplayTrailer,
              },
              {
                isVideo: true,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_trailer_3_thumbnail.jpg"
                ),
                detail: this.revealStreamVideoId,
                title: Localizer.Beyondlight.BeyondLightReveal,
              },
            ]}
            wallpapers={[
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_wallpaper_1_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_wallpaper_1.png"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_wallpaper_2_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_wallpaper_2.png"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_wallpaper_3_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_wallpaper_3.png"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_wallpaper_4_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_wallpaper_4.png"
                ),
              },
            ]}
            screenshots={[
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_screenshot_1_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_screenshot_1.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_screenshot_2_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_screenshot_2.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_screenshot_3_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_screenshot_3.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_screenshot_4_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_screenshot_4.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/media_screenshot_5_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/media_screenshot_5.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/europa_screenshot_1_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/europa_screenshot_1.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/europa_screenshot_2_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/europa_screenshot_2.jpg"
                ),
              },
              {
                isVideo: false,
                thumbnail: Img(
                  "destiny/products/beyondlight/europa_screenshot_3_thumbnail.jpg"
                ),
                detail: Img(
                  "destiny/products/beyondlight/europa_screenshot_3.jpg"
                ),
              },
            ]}
          />
        </div>
      </React.Fragment>
    );
  }
}
