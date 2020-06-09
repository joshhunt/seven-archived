import isEqual from "react-fast-compare";

export class ReactUtils {
  /**
   * Easy way to fast compare
   * @param c The instance of the current component (usually 'this')
   * @param args Pass 'arguments' here
   */
  public static shouldComponentUpdate(c: React.Component, args: IArguments) {
    return ReactUtils.haveChangedMulti([c.props, args[0]], [c.state, args[1]]);
  }

  /**
   * Returns true if o1 and o2 are equal. Uses react-fast-compare.
   * @param o1
   * @param o2
   */
  public static haveChanged<PorS>(o1: PorS, o2: PorS) {
    return !isEqual(o1, o2);
  }

  /**
   * Returns true if each item in every pair are equal. Useful for comparing both state and props.
   * @param pairs
   */
  public static haveChangedMulti(...pairs: [any, any][]) {
    return !pairs.every((pair) => isEqual(pair[0], pair[1]));
  }
}
