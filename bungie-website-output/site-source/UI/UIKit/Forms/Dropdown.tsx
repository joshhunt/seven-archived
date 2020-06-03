import * as React from "react";
import ReactDOM from "react-dom";
import styles from "./Dropdown.module.scss";
import classNames from "classnames";

interface IDropdownProps {
  /** Options to display */
  options: IDropdownOption[];
  /** (Optional) Number of columns of options */
  columns?: number;
  /** If the dropdown should show a selected value outside its internal selection, populate this prop */
  selectedValue?: string;
  /** If you need access to the name of the inner <select> (like for form data submission), set this */
  name?: string;
  /** Triggered when dropdown is changed */
  onChange?: (value: string) => void;

  className?: string;
}

export interface IDropdownOption<T = any> {
  /** The label for the dropdown option */
  label: React.ReactNode;
  /** The value for the dropdown option */
  value: string;
  /** Additional styles for the option */
  style?: React.CSSProperties;
  /** (Optional) Path to an image to use as an icon */
  iconPath?: string;
  /** (Optional) Extra data for this option */
  metadata?: T;
  /** Mobile text only label if label is not a simple string **/
  mobileLabel?: string;
}

interface IDropdownState {
  isOpen: boolean;
  currentValue: string;
}

/**
 * Dropdown item
 *  *
 * @param {IDropdownProps} props
 * @returns
 */
export class Dropdown extends React.Component<IDropdownProps, IDropdownState> {
  private container: HTMLDivElement;

  constructor(props: IDropdownProps) {
    super(props);

    this.state = {
      isOpen: false,
      currentValue: props.selectedValue || props.options[0].value,
    };
  }

  public componentDidUpdate() {
    this.updateIfNeeded();
  }

  public render() {
    const selectOptionsRendered = this.props.options.map((a) => (
      <option key={a.value} value={a.value}>
        {typeof a.mobileLabel !== "undefined" ? a.mobileLabel : a.label}
      </option>
    ));

    const name = this.props.name || "";

    const selectedOptionRendered = this.renderPrettyOption(
      this.selectedOption,
      false
    );

    const classes = classNames(styles.dropdownItem, this.props.className);

    return (
      <div className={classes}>
        <select
          name={name}
          value={this.state.currentValue}
          onChange={(e) => this.onOptionClick(e.target.value)}
        >
          {selectOptionsRendered}
        </select>
        <div className={styles.selectBox} onClick={() => this.toggle()}>
          <div className={styles.currentOption}>{selectedOptionRendered}</div>
        </div>
      </div>
    );
  }

  private get selectedOption() {
    let selectedOption = this.props.options.find(
      (a) => a.value === this.state.currentValue
    );
    if (!selectedOption) {
      selectedOption = this.props.options[0];
    }

    return selectedOption;
  }

  private readonly close = () => this.toggle(false);

  private readonly closeOnClick = (e: MouseEvent) => {
    this.close();
    try {
      const rootNode = ReactDOM.findDOMNode(this);
      if (
        rootNode.contains(e.target as Node) ||
        (this.container && this.container.contains(e.target as Node))
      ) {
        return false;
      }
    } catch (e) {
      // ignore
    }
  };

  private toggle(override?: boolean) {
    const newIsOpen = override !== undefined ? override : !this.state.isOpen;

    if (this.container && !newIsOpen) {
      this.container.remove();
      this.container = null;
    }

    this.setState(
      {
        isOpen: newIsOpen,
      },
      () => {
        if (this.state.isOpen) {
          const el = ReactDOM.findDOMNode(this) as Element;
          const bounding = el.getBoundingClientRect();

          this.renderOptions(bounding);

          document.addEventListener("scroll", this.close);
          document.addEventListener("click", this.closeOnClick);
        } else {
          document.removeEventListener("scroll", this.close);
          document.removeEventListener("click", this.closeOnClick);
        }
      }
    );
  }

  private renderOptions(bounding: ClientRect) {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = `0`;
    container.style.left = `0`;
    container.style.width = "100%";
    document.body.append(container);
    this.container = container;

    const prettyOptionsRendered = this.props.options.map((a) =>
      this.renderPrettyOption(a)
    );

    const top = bounding.top + bounding.height + window.scrollY;
    const left = bounding.left + window.scrollX;

    let optionsEl: HTMLDivElement = null;
    const boxEl = ReactDOM.findDOMNode(this) as Element;

    const options = (
      <div
        className={styles.dropdownSelectOptions}
        data-col=""
        style={{ top, left, position: "absolute" }}
        ref={(el) => (optionsEl = el)}
      >
        <div className={styles.children}>{prettyOptionsRendered}</div>
      </div>
    );

    ReactDOM.render(options, container, () => {
      const optionsHeight = optionsEl.getBoundingClientRect().height;
      const boxHeight = boxEl.getBoundingClientRect().height;

      if (top + optionsHeight > document.body.scrollHeight) {
        optionsEl.style.top = `${top - optionsHeight - boxHeight}px`;
      }

      optionsEl.classList.add(styles.on);
    });
  }

  private renderPrettyOption(option: IDropdownOption, includeOnClick = true) {
    if (!option) {
      return null;
    }

    const onClick = includeOnClick
      ? () => this.onOptionClick(option.value)
      : null;

    const iconRendered = option.iconPath && (
      <div
        className={styles.icon}
        style={{ backgroundImage: `url(${option.iconPath})` }}
      />
    );

    return (
      <div
        className={styles.selectOption}
        data-value={option.value}
        style={option.style}
        onClick={onClick}
        key={option.value}
      >
        {iconRendered}
        <div className={styles.optionLabel}>{option.label}</div>
      </div>
    );
  }

  private readonly onOptionClick = (value: string) => {
    this.setState({
      currentValue: value,
    });
    this.close();
    this.props.onChange && this.props.onChange(value);
  };

  public updateIfNeeded() {
    const selectedValue = this.props.selectedValue;
    const currentValue = this.state.currentValue;

    if (!selectedValue || !currentValue) {
      return;
    }

    if (selectedValue !== currentValue) {
      this.setState({
        currentValue: selectedValue,
      });
    }
  }
}
