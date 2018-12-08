import { observable, computed } from "mobx";

export enum OrganizerStatus {
  Waiting,
  Running
};

export default class AppModel {

  @observable
  public status: OrganizerStatus = OrganizerStatus.Waiting;

  @observable
  public unorganizedDir: string = "";

  @observable
  public organizedDir: string = "";

  @observable
  public duplicatesDir: string = "";

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