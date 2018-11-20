import { observable, computed } from "mobx";

const initialSlides = [

  "# exhibitext\r\n *No slides here yet.* \r\n\r\n To get started click the '...' to select a file to display. "

];

export enum OrganizerStatus {
  Waiting,
  Running
};

export default class AppModel {

  @observable
  public status: OrganizerStatus = OrganizerStatus.Waiting;

  @observable
  public unorganizedDir: string = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\unorganized";

  @observable
  public organizedDir: string = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\organized";

  @observable
  public duplicatesDir: string = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\duplicates";

  @observable
  public fileCount: number = 0;

  @observable
  public organizedCount: number = 0;

  @observable
  public skippedCount: number = 0;

  @observable
  public duplicatesCount: number = 0;

  @observable
  public errorCount: number = 0;
}