
import { observer } from "mobx-react";
import * as React from "react";
import { createOrganizer } from "../Organizer";
import AppModel from "../models/AppModel";
import { action } from "mobx";

export interface AppProps { model: AppModel }

@observer
export class App extends React.Component<AppProps, {}> {
    render() {
        const { model } = this.props;

        return <div>
            <h1>Hello</h1>
            <button onClick={this.handleRun}>Run</button>
            <div><span>Files: </span><span>{model.fileCount}</span></div>
            <div><span>Organized: </span><span>{model.organizedCount}</span></div>
            <div><span>Duplicates: </span><span>{model.duplicatesCount}</span></div>
            <div><span>Skipped: </span><span>{model.skippedCount}</span></div>
            <div><span>Errors: </span><span>{model.errorCount}</span></div>
        </div>;
    }

    @action
    private onStartedDir = (dir: string): void => {
        console.log(`Started directory: ${dir}`);
    };

    @action
    private onFinishedDir = (dir: string): void => {
        console.log(`Finished directory: ${dir}`);
    };

    @action
    private onStartedFile = (file: string): void => {
        console.log(`Started file: ${file}`);
        this.props.model.fileCount++;

    };

    @action
    private onFinishedFile = (file: string): void => {
        console.log(`Finished file: ${file}`);        
    };

    @action
    private onNoOp = (file: string): void => {
        console.log(`No-Op: ${file}`);
    };

    @action
    private onSkipped = (file: string): void => {
        console.log(`Skipped: ${file}`);
        this.props.model.skippedCount++;
    };

    @action
    private onMoved = (fromFile: string, toFile: string): void => {
        console.log(`Moved: ${fromFile} -> ${toFile}`);
        this.props.model.organizedCount++;
    };

    @action
    private onDuplicateMoved = (fromFile: string, toFile): void => {
        console.log(`Duplicate: ${fromFile} -> ${toFile}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onDuplicateNoOp = (file: string, hash: string): void => {
        console.log(`Duplicate: ${file}  Hash: ${hash}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onError = (file: string, error: Error): void => {
        console.log(`Error: ${file} ${error}`);
        this.props.model.errorCount++;
    };

    handleRun = async () => {
        const props = {
            unorganizedDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\unorganized",
            organizedDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\organized",
            duplicatesDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\current\\duplicates",
            onStartedDir: this.onStartedDir,
            onFinishedDir: this.onFinishedDir,
            onStartedFile: this.onStartedFile,
            onNoOp: this.onNoOp,
            onSkipped: this.onSkipped,
            onMoved: this.onMoved,
            onDuplicateMoved: this.onDuplicateMoved,
            onDuplicateNoOp: this.onDuplicateNoOp,
            onError: this.onError
        };

        const organizer = createOrganizer(props);
        await organizer.organize();
    }
}