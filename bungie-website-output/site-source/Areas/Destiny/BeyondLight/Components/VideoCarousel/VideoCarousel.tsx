// Created by a-tmorris, 2020
// Copyright Bungie, Inc.

import React from "react";
import styles from "./VideoCarousel.module.scss";
import { VideoBlock } from "../index";
import YoutubeModal from "@UI/UIKit/Controls/Modal/YoutubeModal";
import { VideoSlider } from "./VideoSlider";

interface IVideoCarouselProps {
  firstPanelVideo?: string;
  firstPanelPoster?: string;
  firstPanelTitle?: string;
  firstPanelEyebrow?: string;
  firstPanelDescription?: string;

  secondPanelVideo?: string;
  secondPanelPoster?: string;
  secondPanelTitle?: string;
  secondPanelEyebrow?: string;
  secondPanelDescription?: string;

  thirdPanelVideo?: string;
  thirdPanelPoster?: string;
  thirdPanelTitle?: string;
  thirdPanelEyebrow?: string;
  thirdPanelDescription?: string;

  isMedium: boolean;
  backgroundCandy?: string;
  backgroundImage?: string;
}

const VideoCarousel: React.FC<IVideoCarouselProps> = ({
  firstPanelVideo,
  firstPanelPoster,
  firstPanelTitle,
  firstPanelEyebrow,
  firstPanelDescription,
  secondPanelVideo,
  secondPanelPoster,
  secondPanelTitle,
  secondPanelEyebrow,
  secondPanelDescription,
  thirdPanelVideo,
  thirdPanelPoster,
  thirdPanelTitle,
  thirdPanelDescription,
  thirdPanelEyebrow,
  backgroundCandy,
  backgroundImage,
  isMedium,
}: IVideoCarouselProps) => {
  const showVideo = (videoId: string) => {
    if (isMedium) {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      window.location.href = videoUrl;
    } else {
      YoutubeModal.show({ videoId });
    }
  };

  return (
    <>
      {firstPanelVideo ? (
        <section
          className={styles.videoCarouselWrapper}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <span className={styles.topBorder} />

          <VideoSlider backgroundCandy={backgroundCandy}>
            {firstPanelVideo && (
              <div className={styles.panelContainer}>
                <p className={styles.eyebrow}>{firstPanelEyebrow}</p>
                <h2>{firstPanelTitle}</h2>
                <span className={styles.shortBorder} />
                <p>{firstPanelDescription}</p>
                <div
                  className={styles.videoContainer}
                  style={{ backgroundImage: `url(${firstPanelPoster})` }}
                >
                  <div
                    role="button"
                    className={styles.firstPanel}
                    onClick={() => showVideo(firstPanelVideo)}
                  >
                    <div className={styles.videoPlayButton} />
                  </div>
                </div>
              </div>
            )}

            {secondPanelVideo ? (
              <div className={styles.panelContainer}>
                <p className={styles.eyebrow}>{secondPanelEyebrow}</p>
                <h2>{secondPanelTitle}</h2>
                <span className={styles.shortBorder} />
                <p>{secondPanelDescription}</p>

                <div
                  className={styles.videoContainer}
                  style={{ backgroundImage: `url(${secondPanelPoster})` }}
                >
                  <div
                    role="button"
                    className={styles.secondPanel}
                    onClick={() => showVideo(secondPanelVideo)}
                  >
                    <div className={styles.videoPlayButton} />
                  </div>
                </div>
              </div>
            ) : null}

            {thirdPanelVideo ? (
              <div className={styles.panelContainer}>
                <p className={styles.eyebrow}>{thirdPanelEyebrow}</p>
                <h2>{thirdPanelTitle}</h2>
                <span className={styles.shortBorder} />
                <p>{thirdPanelDescription}</p>
                <div
                  className={styles.videoContainer}
                  style={{
                    backgroundImage: `url(${thirdPanelPoster})`,
                  }}
                >
                  <div
                    role="button"
                    className={styles.thirdPanel}
                    onClick={() => showVideo(thirdPanelVideo)}
                  >
                    <div className={styles.videoPlayButton} />
                  </div>
                </div>
              </div>
            ) : null}
          </VideoSlider>
        </section>
      ) : null}
    </>
  );
};

export default VideoCarousel;
