import * as React from "react";
import classNames from "classnames";
import styles from "./Modal.module.scss";
import { InnerErrorBoundary } from "@UI/Errors/InnerErrorBoundary";
import { RequiresAuth } from "@UI/User/RequiresAuth";
import { Icon } from "../Icon";
import { GlobalState } from "@Global/DataStore/GlobalStateDataStore";
import { withRouter, RouteComponentProps } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import { Localizer } from "@Global/Localizer";
import { DetailedError } from "@CustomErrors";
import { GlobalElementDataStore } from "@Global/DataStore/GlobalElementDataStore";
import { BrowserUtils } from "@Utilities/BrowserUtils";

export enum ModalOverflowTypes {
  /**
   * The modal box will have a scrollbar inside itself
   */
  scrollinmodal,
  /**
   * The modal box will be able to scroll within the full-page modal container
   */
  scrolloutsidemodal,
}

interface DefaultProps {
  /** If true, the modal shows as open */
  open: boolean;
  /** Called when the modal is closed */
  onClose: () => void;
  /** If true, will display confirm buttons */
  confirm: boolean;
  /** Determines the scroll type. */
  overflowType: ModalOverflowTypes;
  /** Hide modal frame */
  isFrameless: boolean;
  /** If true, modal cannot be closed */
  preventUserClose: boolean;
}

interface IModalProps {
  /** Classname for the modal container */
  containerClassName?: string;

  /** Classname for the modal itself */
  className?: string;

  /** Classname for the modal content */
  contentClassName?: string;
}

interface IModalState {
  open: boolean;
}

export type ModalProps = IModalProps & Partial<DefaultProps>;

/**
 * Create a modal and show it via GlobalElementDataStore
 * @param children The stuff that goes in the modal
 * @param props The properties for the modal
 * @param existingRef If we want to preserve a reference instead of creating a new one, pass it here and it will be used
 */
export const showModalInternal = (
  children: React.ReactNode,
  props?: ModalProps,
  existingRef?: React.RefObject<Modal>
): React.RefObject<Modal> => {
  const modalRef = existingRef || React.createRef<Modal>();

  const modalGuid = Math.ceil(Math.random() * 1000000);

  const onClose = () => {
    setTimeout(() => {
      GlobalElementDataStore.removeModal(modalGuid);

      BrowserUtils.unlockScroll();

      setTimeout(() => {
        props && props.onClose && props.onClose();
      }, 100);
    }, 250);
  };

  const modal = (
    <Modal ref={modalRef} open={true} onClose={onClose} {...props}>
      <InnerErrorBoundary>{children}</InnerErrorBoundary>
    </Modal>
  );

  GlobalElementDataStore.addElement(modalRef, modalGuid, modal);

  return modalRef;
};

/**
 * Displays a modal over the rest of the page content
 *  *
 * @param {IModalProps} props
 * @returns
 */

export class Modal extends React.Component<ModalProps, IModalState> {
  private modalRef: HTMLDivElement;
  private scrollableRef: HTMLDivElement;

  public static defaultProps: DefaultProps = {
    open: false,
    confirm: false,
    onClose: () => {
      void 0;
    },
    overflowType: ModalOverflowTypes.scrollinmodal,
    isFrameless: false,
    preventUserClose: false,
  };

  constructor(props: ModalProps) {
    super(props);

    this.state = {
      open: false,
    };
  }

  private readonly delayedOpen = () =>
    setTimeout(
      () =>
        this.setState({
          open: true,
        }),
      100
    );

  public componentDidMount() {
    if (this.props.open) {
      this.delayedOpen();
    }
  }

  public shouldComponentUpdate(nextProps: ModalProps) {
    if (nextProps.open && !this.props.open && !this.state.open) {
      this.delayedOpen();
    }

    if (this.state.open && !nextProps.open) {
      this.close();
    }

    return true;
  }

  /**
   * Creates a new modal and opens it, returning a reference to the Modal
   * @param children The content to show in the modal
   * @param props Optional props passed to the modal
   */
  public static open(children: React.ReactNode, props?: ModalProps) {
    return showModalInternal(children, props);
  }

  /**
   * Creates a new modal showing Sign In options
   * @param globalState The state from which we will get the info to show the auth stuff
   * @param onSignIn Optional callback triggered when a user signs in
   * @param props Optional props passed to the modal
   */
  public static signIn(
    onSignIn = (temporaryGlobalState: GlobalState<"loggedInUser">) => void 0,
    props?: ModalProps
  ) {
    return showModalInternal(<RequiresAuth onSignIn={onSignIn} />, {
      ...props,
      className: classNames((props && props.className) || "", styles.authModal),
    });
  }

  public static error(error: Error, props?: ModalProps) {
    const title = error instanceof DetailedError ? error.title : null;

    return ConfirmationModal.show(
      {
        children: <div dangerouslySetInnerHTML={{ __html: error.message }} />,
        title,
        type: "warning",
        cancelButtonProps: {
          buttonType: "red",
          labelOverride: Localizer.Messages.ErrorModalClose,
        },
        confirmButtonProps: {
          disable: true,
        },
      },
      { ...props, preventUserClose: false }
    );
  }

  public close = () => {
    this.setState(
      {
        open: false,
      },
      () => {
        this.props.onClose && this.props.onClose();
      }
    );
  };

  private readonly onContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickedInside = this.modalRef.contains(e.target as Element);
    const clickedModal = e.target === this.modalRef;
    if (!clickedModal && !clickedInside && !this.props.preventUserClose) {
      this.close();
    }
  };

  public render() {
    const {
      containerClassName,
      className,
      contentClassName,
      overflowType,
      children,
    } = this.props;

    const closeButton = !this.props.preventUserClose && (
      <div className={styles.buttonClose} onClick={this.close}>
        <Icon iconType={"material"} iconName={"close"} />
      </div>
    );

    const closeButtonInside = overflowType === ModalOverflowTypes.scrollinmodal;

    const containerClass = classNames(
      "modalContainer",
      styles.modalContainer,
      containerClassName,
      {
        [styles.open]: this.state.open,
      }
    );

    const modalClass = classNames(styles.modal, className);

    const modalContentClass = classNames(
      styles.modalContent,
      contentClassName,
      {
        [styles.frameless]: this.props.isFrameless,
      }
    );

    if (this.state.open) {
      BrowserUtils.lockScroll(this.scrollableRef);
    } else if (!this.state.open) {
      BrowserUtils.unlockScroll(this.scrollableRef);
    }

    // This makes sure modals close before switching from one React page to another on back button click
    window.onpopstate = this.close;

    return (
      <div
        className={containerClass}
        data-overflowtype={ModalOverflowTypes[overflowType]}
        onClick={this.onContainerClick}
      >
        {!closeButtonInside && closeButton}
        <div className={modalClass} ref={(ref) => (this.modalRef = ref)}>
          {closeButtonInside && closeButton}
          <div
            className={modalContentClass}
            ref={(ref) => (this.scrollableRef = ref)}
          >
            {children}
          </div>
          <div className={styles.modalAfterContent} />
        </div>
        <HistoryListener modalRef={this.modalRef} />
      </div>
    );
  }
}

interface IHistoryListener extends RouteComponentProps {
  modalRef: HTMLDivElement;
}

const _HistoryListener: React.SFC<IHistoryListener> = ({
  history,
  modalRef,
}) => {
  React.useEffect(
    () =>
      history.listen(() => {
        BrowserUtils.unlockScroll(modalRef);
      }),
    []
  );

  return null;
};

const HistoryListener = withRouter(_HistoryListener);
