import { DataStore } from "@Global/DataStore";
import { Platform, Content } from "@Platform";

export interface IFirehoseDebuggerItemData
  extends Pick<
    Content.ContentItemPublicContract,
    "cmsPath" | "contentId" | "cType"
  > {
  children: IFirehoseDebuggerItemData[];
}

export interface IFirehoseDebuggerState {
  contentItems: IFirehoseDebuggerItemData[];
}

class FirehoseDebuggerDataStoreInternal extends DataStore<
  IFirehoseDebuggerState
> {
  public static Instance = new FirehoseDebuggerDataStoreInternal({
    contentItems: [],
  });

  public add = (contract: Content.ContentItemPublicContract) => {
    let children = [];
    /* There can be multiple values inside the contract.properties that are lists, 
		so we look for lists where the items in the list have their own contentId 
		then add each of those items to the children array */
    Object.values(contract.properties).forEach(
      (v) =>
        Array.isArray(v) && v.forEach((c) => c.contentId && children.push(c))
    );

    const newContentItem: IFirehoseDebuggerItemData = {
      cmsPath: contract.cmsPath,
      contentId: contract.contentId,
      cType: contract.cType,
      children: children,
    };

    const contentItems = [newContentItem, ...this.state.contentItems];

    this.update({ contentItems });
  };

  public clear = () => {
    this.update({ contentItems: [] });
  };
}

export const FirehoseDebuggerDataStore =
  FirehoseDebuggerDataStoreInternal.Instance;
