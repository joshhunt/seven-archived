// Created by larobinson, 2020
// Copyright Bungie, Inc.

import {
  D2DatabaseComponentProps,
  withDestinyDefinitions,
} from "@Database/DestinyDefinitions/WithDestinyDefinitions";
import { Localizer } from "@Global/Localizer";
import { Dropdown, IDropdownOption } from "@UI/UIKit/Forms/Dropdown";
import * as React from "react";

// Required props
interface IDestinyActivityModesSelectorProps
  extends D2DatabaseComponentProps<
    | "DestinyActivityModeDefinition"
    | "DestinyActivityTypeDefinition"
    | "DestinyActivityDefinition"
  > {
  className?: string;
}

// Default props - these will have values set in DestinyActivityModesSelector.defaultProps
interface DefaultProps {}

export type DestinyActivityModesSelectorProps = IDestinyActivityModesSelectorProps &
  DefaultProps;

interface IDestinyActivityModesSelectorState {
  selectedValue: string;
}

/**
 * DestinyActivityModesSelector - Replace this description
 *  *
 * @param {IDestinyActivityModesSelectorProps} props
 * @returns
 */
class DestinyActivityModesSelector extends React.Component<
  DestinyActivityModesSelectorProps,
  IDestinyActivityModesSelectorState
> {
  constructor(props: DestinyActivityModesSelectorProps) {
    super(props);

    this.state = {
      selectedValue: Localizer.Profile.All,
    };
  }

  public static defaultProps: DefaultProps = {};

  private readonly createActivityOptions = () => {
    const parentModes = [];
    const childModes = [];
    const activityOptions: IDropdownOption[] = [];
    const { selectedValue } = this.state;

    const allModes = this.props.definitions.DestinyActivityModeDefinition.all();

    // Separate into modes without parents and modes with parents
    Object.keys(allModes).forEach((hash) => {
      if (
        !allModes[hash].redacted &&
        allModes[hash].friendlyName !== "social"
      ) {
        if (
          allModes[hash].parentHashes?.length >= 1 &&
          !allModes[allModes[hash].parentHashes[0]].parentHashes
        ) {
          childModes.push(allModes[hash]);
        } else if (
          !allModes[hash].parentHashes ||
          allModes[hash].parentHashes.length === 0
        ) {
          parentModes.push(allModes[hash]);
        }
      }
    });

    // Sort arrays
    parentModes.sort((a, b) => a.index - b.index);
    childModes.sort((a, b) => a.index - b.index);

    // Assemble family
    const familyArray = parentModes.map((parent) => {
      return {
        rootMode: parent,
        childModes: childModes.filter(
          (child) => child.parentHashes[0] === parent.hash
        ),
      };
    });

    // Create options
    familyArray.forEach((obj) => {
      activityOptions.push({
        label: obj.rootMode.displayProperties.name,
        value: obj.rootMode.hash,
        iconPath: obj.rootMode.displayProperties.icon,
      });

      obj.childModes.forEach((child) => {
        activityOptions.push({
          label: child.displayProperties.name,
          value: child.hash,
          iconPath: child.displayProperties.icon,
          style: { paddingLeft: `${child.hash !== selectedValue && "3rem"}` },
        });
      });
    });

    return activityOptions;
  };

  public render() {
    return (
      <Dropdown
        options={this.createActivityOptions()}
        className={this.props.className}
      />
    );
  }
}

export default withDestinyDefinitions(DestinyActivityModesSelector, {
  types: [
    "DestinyActivityModeDefinition",
    "DestinyActivityTypeDefinition",
    "DestinyActivityDefinition",
  ],
});
