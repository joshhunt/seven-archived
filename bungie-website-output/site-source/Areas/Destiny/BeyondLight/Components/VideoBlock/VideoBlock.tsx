// Created by a-tmorris, 2020
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "./VideoBlock.module.scss";
import YoutubeModal from "@UI/UIKit/Controls/Modal/YoutubeModal";
import classNames from "classnames";

interface IVideoBlockProps {
  videoPath: string;
  videoThumbnail: string;
  alignment?: "center" | "right";
  isMedium: boolean;
}

const VideoBlock: React.FC<IVideoBlockProps> = ({
  videoPath,
  videoThumbnail,
  alignment,
  isMedium,
}) => {
  const showVideo = (videoId: string) => {
    if (isMedium) {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      window.location.href = videoUrl;
    } else {
      YoutubeModal.show({ videoId });
    }
  };

  return (
    <div
      className={classNames(styles.videoContainer, styles[alignment])}
      style={{ backgroundImage: `url(${videoThumbnail})` }}
    >
      <div
        role="button"
        className={styles.thumbnail}
        onClick={() => showVideo(videoPath)}
      >
        <div className={styles.videoPlayButton} />
      </div>
    </div>
  );
};

export default VideoBlock;
