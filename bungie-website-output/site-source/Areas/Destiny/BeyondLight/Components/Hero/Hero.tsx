// Created by a-tmorris, 2020
// Copyright Bungie, Inc.

import { IMultiSiteLink } from "@Routes/RouteHelper";
import * as React from "react";
import styles from "./Hero.module.scss";
import { Button, ButtonTypes } from "@UI/UIKit/Controls/Button/Button";
import YoutubeModal from "@UI/UIKit/Controls/Modal/YoutubeModal";

// Required props
interface IHeroProps {
  posterPath: string;
  videoLoopPath?: string;
  eyebrow?: string;
  heading: string;
  subheading?: string;
  logoPath?: string;
  videoPlayButtonText: string;
  youTubeVideoId: string;
  videoPlayButtonType: ButtonTypes;
  buttonOneText?: string;
  buttonOneLink?: string | IMultiSiteLink;
  buttonOneType?: ButtonTypes;
  buttonTwoText?: string;
  buttonTwoLink?: string | IMultiSiteLink;
  buttonTwoType?: ButtonTypes;
  isMedium: boolean;
  isMobile?: boolean;
  releaseDateEyebrow?: string;
  releaseDate?: string;
  overlayImage?: string;
  mobileBgPath?: string;
  bgColor?: string;
}

/**
 * Hero - Returns top section for Beyond Light Pages that contains a video, a videoloop, a post, button (or buttons), heading, subheading
 *  *
 * @param {IHeroProps} props
 * @returns
 */
const Hero = ({
  youTubeVideoId,
  bgColor,
  isMobile,
  mobileBgPath,
  posterPath,
  videoLoopPath,
  eyebrow,
  subheading,
  heading,
  logoPath,
  buttonOneLink,
  buttonOneType,
  buttonOneText,
  buttonTwoText,
  buttonTwoLink,
  buttonTwoType,
  isMedium,
  releaseDate,
  releaseDateEyebrow,
  overlayImage,
  videoPlayButtonText,
  videoPlayButtonType,
}: IHeroProps) => {
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
      className={styles.hero}
      style={{
        backgroundImage: isMobile
          ? `url(${mobileBgPath})`
          : `url(${posterPath})`,
        backgroundColor: bgColor ? bgColor : "rgb(33, 40, 51)",
      }}
    >
      <div className={styles.videoContainer}>
        <video
          playsInline={true}
          autoPlay={true}
          muted={true}
          loop={true}
          poster={posterPath}
        >
          {videoLoopPath && <source src={videoLoopPath} type="video/mp4" />}
        </video>
      </div>
      {overlayImage && (
        <div
          className={styles.overlay}
          style={{ backgroundImage: `url(${overlayImage})` }}
        />
      )}

      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        {logoPath && (
          <h1
            className={styles.heroTitle}
            style={{ backgroundImage: `url(${logoPath})` }}
          >
            {heading}
          </h1>
        )}
        {heading && !logoPath && <h1 className={styles.heading}>{heading}</h1>}
        {subheading && (
          <div className={styles.subtitle}>
            <span>{subheading}</span>
          </div>
        )}

        <div className={styles.buttons}>
          {youTubeVideoId && (
            <Button
              buttonType={videoPlayButtonType}
              onClick={() => showVideo(youTubeVideoId)}
            >
              {videoPlayButtonText}
            </Button>
          )}
          {buttonOneLink && (
            <Button buttonType={buttonOneType} url={buttonOneLink}>
              {buttonOneText}
            </Button>
          )}
          {buttonTwoLink && (
            <Button buttonType={buttonTwoType} url={buttonTwoLink}>
              {buttonTwoText}
            </Button>
          )}
        </div>
        {releaseDateEyebrow && (
          <span className={styles.releaseDateEyebrow}>
            {releaseDateEyebrow}
          </span>
        )}
        {releaseDate && (
          <span className={styles.releaseDate}>{releaseDate}</span>
        )}
      </div>
    </div>
  );
};

export default Hero;
