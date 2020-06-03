// Created by a-tmorris, 2020
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "./MediaSection.module.scss";
import classNames from "classnames";
import { TextBlock, VideoBlock } from "../index";

interface IMediaSectionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  alignment?: "center" | "right";
  videoId?: string;
  videoTitle?: string;
  videoThumbnail?: string;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  isMedium: boolean;
  isMobile: boolean;
  bgColor?: string;
  reverseColumn?: boolean;
}

/**
 * Component - Replace this description
 *  *
 * @param {IMediaSectionProps} props
 * @returns
 */
const MediaSection = ({
  eyebrow,
  title,
  subtitle,
  body,
  videoId,
  videoThumbnail,
  alignment,
  backgroundImage,
  backgroundImageMobile,
  isMedium,
  isMobile,
  bgColor,
  reverseColumn,
}: IMediaSectionProps) => {
  return (
    <section
      className={classNames(styles.mediaSectionContainer, styles[alignment])}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={styles.bgContainer}
        style={{
          backgroundImage:
            isMobile && backgroundImageMobile
              ? `url(${backgroundImageMobile})`
              : `url(${backgroundImage})`,
        }}
      >
        <div
          className={styles.contentWrapper}
          style={{
            flexDirection: isMobile && reverseColumn ? "column-reverse" : null,
          }}
        >
          <TextBlock
            reverseColumn={reverseColumn}
            title={title}
            subtitle={subtitle}
            eyebrow={eyebrow}
            body={body}
            alignment={alignment}
            videoProps={videoId || null}
          />
          {videoId && (
            <VideoBlock
              videoPath={videoId}
              videoThumbnail={videoThumbnail}
              alignment={alignment}
              isMedium={isMedium}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MediaSection;
