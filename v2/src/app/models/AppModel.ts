import { observable, computed } from "mobx";

const initialSlides = [

  "# exhibitext\r\n *No slides here yet.* \r\n\r\n To get started click the '...' to select a file to display. "

];



export default class AppModel {

@observable
public organizedDir : string;

@observable
public unorganizedDir : string;

@observable
public duplicatesDir : string;

@observable
public fileCount : number = 0;

@observable
public organizedCount : number = 0;

@observable
public skippedCount : number = 0;

@observable
public duplicatesCount : number = 0;

@observable
public errorCount : number = 0;

}