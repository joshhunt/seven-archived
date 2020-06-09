// Created by jlauer, 2019
// Copyright Bungie, Inc.

import * as React from "react";
import styles from "./FullPageLoadingBar.module.scss";
import classNames from "classnames";

// Required props
interface IFullPageLoadingBarProps {
  loading: boolean;
}

// Default props - these will have values set in FullPageLoadingBar.defaultProps
interface DefaultProps {}

type Props = IFullPageLoadingBarProps & DefaultProps;

interface IFullPageLoadingBarState {
  loading: boolean;
  loaded: boolean;
}

/**
 * FullPageLoadingBar - Replace this description
 *  *
 * @param {IFullPageLoadingBarProps} props
 * @returns
 */
export class FullPageLoadingBar extends React.Component<
  Props,
  IFullPageLoadingBarState
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: props.loading,
      loaded: false,
    };
  }

  public static defaultProps: DefaultProps = {};

  public componentWillUnmount() {
    this.setState({
      loaded: true,
    });
  }

  public static getDerivedStateFromProps(
    props: Props,
    state: IFullPageLoadingBarState
  ): IFullPageLoadingBarState {
    return {
      ...state,
      loading: props.loading,
      loaded: state.loading && !props.loading,
    };
  }

  public render() {
    const classes = classNames(styles.loadingBar, {
      [styles.loading]: this.props.loading && !this.state.loaded,
      [styles.loaded]: this.state.loaded,
    });

    return <div className={classes} />;
  }
}
