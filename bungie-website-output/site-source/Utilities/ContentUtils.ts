import { Content } from "@Platform";
import { IMarketingMediaAsset } from "@Areas/Seasons/ProductPages/Season10/SeasonOfTheWorthy";

export class ContentUtils {
  public static marketingMediaAssetFromContent(
    contentItem: Content.ContentItemPublicContract
  ): IMarketingMediaAsset {
    return {
      contentItemTitle: contentItem.properties["ContentItemTitle"],
      videoId: contentItem.properties["VideoId"],
      loopingVideoThumbnail: contentItem.properties["LoopingVideoThumbnail"],
      videoThumbnail: contentItem.properties["VideoThumbnail"],
      videoMp4: contentItem.properties["VideoMp4"],
      imageThumbnail: contentItem.properties["ImageThumbnail"],
      largeImage: contentItem.properties["LargeImage"],
      title: contentItem.properties["Title"],
      subtitle: contentItem.properties["Subtitle"],
      hyperlink: contentItem.properties["Hyperlink"],
      fontColor: contentItem.properties["FontColor"],
      buttonLink: contentItem.properties["ButtonLink"],
      buttonSku: contentItem.properties["ButtonSku"],
      buttonLabel: contentItem.properties["ButtonLabel"],
    };
  }
}
