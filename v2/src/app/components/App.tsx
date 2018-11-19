
import { observer } from "mobx-react";
import * as React from "react";
import { createOrganizer } from "../Organizer";
import AppModel from "../models/AppModel";
import { action } from "mobx";
import { style } from "typestyle";
import electron = require("electron");
import { url } from "csx";

const headerClass = style({
    background: "#333333",
    height: "75px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
});

const photisoLogo = style({
    backgroundImage: url("/static/photiso.png"),
    width: "42px",
    height: "52px",
    margin: "10px"
});

const headerDescriptionClass = style({
    fontFamily: "Segoe UI Light",
    fontSize: "14pt",
    color: "#A6A6A6",
    margin: "10px"
});

const labelMixin = {
    fontFamily: "Segoe UI Light",
    fontSize: "18pt",
}

const dirLabelClass = style(labelMixin, {
    margin: "10px 0"
});

const dirClass = style({
    minWidth: "450px",
    fontFamily: "Segoe UI Light",
    fontSize: "12pt",
    display: "inline-block",
    padding: "5px"
});

const browseDirButtonClass = style({
    display: "inline-block",
    fontFamily: "Segoe UI Light",
    fontSize: "12pt",
    margin: "0 0 0 -1px",
    minWidth: "50px",
    padding: "5px"
});

const actionSectionClass = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    margin: "10px"
});

const startButtonClass = style({
    padding: "5px 10px",
    minWidth: "200px",
    fontFamily: "Segoe UI Light",
    fontSize: "18pt",
});

const statSectionClass = style({
    borderTop: "1px solid #CCCCCC",
    flexGrow: 0,
    flexShrink: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "stretch",
    padding: "5px"
});

const statClass = style({
    display: "flex",
    flexDirection: "column",
    alignContent: "flex-start",
    margin: "5px",
    padding: "0 5px 10px 0px",
    width: "100%",
    textAlign: "center",
    fontFamily: "Segoe UI Light",
    $nest: {
        "&:first-child": {
            borderRight: "1px solid #CCCCCC"
        }
    }
});

const countMixin = {
    flexBasis: "100%",
    flexGrow: 1,
    fontSize: "34pt"
}

const foundCountClass = style(countMixin, {
});

const organizedCountClass = style(countMixin, {
    color: "#5D895C" //FF5D895C
});

const duplicatesCountClass = style(countMixin, {
    color: "#A19045" //FFA19045
});

const skippedCountClass = style(countMixin, {
    color: "#5C7589" //FF5C7589
});

const errorCountClass = style(countMixin, {
    color: "#8A5C5C" //FF8A5C5C
});

const statLabelClass = style(labelMixin, {
    flexGrow: 0
});





export interface AppProps { model: AppModel; }

interface AppState { unorganizedDir: string; }

@observer
export class App extends React.Component<AppProps, AppState> {


    constructor(props: AppProps) {
        super(props);
        this.state = {
            unorganizedDir: ''
        };
    }

    render() {
        const { model } = this.props;

        return <div>
            <div className={headerClass}>
                <div className={photisoLogo}></div>
                <div className={headerDescriptionClass}>Photiso organizes your photos by date taken into year/month folders</div>
            </div>
            <div>
                <div>
                    <div className={dirLabelClass}>Unorganized</div>
                    <input className={dirClass} value={model.unorganizedDir} onChange={this.handleUnorganizedDirChanged} />
                    <button className={browseDirButtonClass} onClick={this.browseUnorganizedDir}>...</button>
                </div>
                <div>
                    <div className={dirLabelClass}>Organized</div>
                    <input className={dirClass} value={model.organizedDir} onChange={this.handleOrganizedDirChanged} />
                    <button className={browseDirButtonClass} onClick={this.browseOrganizedDir}>...</button>
                </div>
                <div>
                    <div className={dirLabelClass}>Duplicates</div>
                    <input className={dirClass} value={model.duplicatesDir} onChange={this.handleDuplicatesDirChanged} />
                    <button className={browseDirButtonClass} onClick={this.browseDuplicatesDir}>...</button>
                </div>
            </div>
            <div className={actionSectionClass}>
                <button className={startButtonClass} onClick={this.handleStart}>Start</button>
            </div>
            <div className={statSectionClass}>
                <div className={statClass}>
                    <div className={foundCountClass}>{model.fileCount}</div>
                    <div className={statLabelClass}>found</div>
                </div>
                <div className={statClass}>
                    <div className={organizedCountClass}>{model.organizedCount}</div>
                    <div className={statLabelClass}>organized</div>
                </div>
                <div className={statClass}>
                    <div className={duplicatesCountClass}>{model.duplicatesCount}</div>
                    <div className={statLabelClass}>duplicates</div></div>
                <div className={statClass}>
                    <div className={skippedCountClass}>{model.skippedCount}</div>
                    <div className={statLabelClass}>skipped</div>
                </div>
                <div className={statClass}>
                    <div className={errorCountClass}>{model.errorCount}</div>
                    <div className={statLabelClass}>errors</div>
                </div>
            </div>
        </div>;
    }

    @action
    private browseUnorganizedDir = (): void => {
        const dir = this.browseDir(this.props.model.unorganizedDir);
        if (dir !== undefined) {
            this.props.model.unorganizedDir = dir;
        }
    };

    @action
    private browseOrganizedDir = (): void => {
        const dir = this.browseDir(this.props.model.organizedDir);
        if (dir !== undefined) {
            this.props.model.organizedDir = dir;
        }
    };

    @action
    private browseDuplicatesDir = (): void => {
        const dir = this.browseDir(this.props.model.duplicatesDir);
        if (dir !== undefined) {
            this.props.model.duplicatesDir = dir;
        }
    };

    private browseDir = (initialDir: string): string => {
        const remote = electron.remote;
        const dirs = remote.dialog.showOpenDialog({
            defaultPath: initialDir,
            properties: ["openDirectory"],
            title: "Open Direcotry"
        });

        if (dirs && dirs.length === 1) {
            const dir = dirs[0];
            return dir;
        }

        return undefined;
    };

    @action
    private onStartedDir = (dir: string): void => {
        console.log(`${dir}`);
    };

    @action
    private onFinishedDir = (dir: string): void => {
        console.log(`${dir}`);
    };

    @action
    private onStartedFile = (file: string): void => {
        console.log(`     ${file}`);
        this.props.model.fileCount++;

    };

    @action
    private onFinishedFile = (file: string): void => {
    };

    @action
    private onNoOp = (file: string): void => {
        console.log(`     => no-op)`);
    };

    @action
    private onSkipped = (file: string): void => {
        console.log(`     => skipped`);
        this.props.model.skippedCount++;
    };

    @action
    private onMoved = (fromFile: string, toFile: string): void => {
        console.log(`     => moved: ${toFile}`);
        this.props.model.organizedCount++;
    };

    @action
    private onDuplicateMoved = (fromFile: string, toFile): void => {
        console.log(`     => duplicate: ${toFile}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onDuplicateNoOp = (file: string, hash: string): void => {
        console.log(`     => duplicate no-op: ${file} ${hash}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onError = (file: string, error: Error): void => {
        console.log(`     => error: ${file} ${error}`);
        this.props.model.errorCount++;
    };

    @action
    private handleUnorganizedDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.unorganizedDir = e.currentTarget.value;
    }

    @action
    private handleOrganizedDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.organizedDir = e.currentTarget.value;
    }

    @action
    private handleDuplicatesDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.duplicatesDir = e.currentTarget.value;
    }

    @action
    private clearCounts = (): void => {
        const { model } = this.props;
        model.fileCount = 0;
        model.organizedCount = 0;
        model.duplicatesCount = 0;
        model.skippedCount = 0;
        model.errorCount = 0;
    }

    handleStart = async () => {
        const { model: { unorganizedDir, organizedDir, duplicatesDir } } = this.props;
        const organizerProps = {
            unorganizedDir: unorganizedDir,
            organizedDir: organizedDir,
            duplicatesDir: duplicatesDir,
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

        this.clearCounts();
        const organizer = createOrganizer(organizerProps);
        await organizer.organize();
    }
}