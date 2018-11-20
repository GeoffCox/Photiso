
import { observer } from "mobx-react";
import * as React from "react";
import { createOrganizer } from "../organizer";
import AppModel from "../models/AppModel";
import { action } from "mobx";
import { style } from "typestyle";
import electron = require("electron");
import { url } from "csx";
import { Stats} from "./stats"

/*

Page 1:

Photiso organizes photos and images.

Q: How does Photiso organize photos?
Each file is examined for photo information to get the date taken.
Each photo file is placed into a <year>/<month> folder structure.  
Example: All the photos taken in April of 2008 would be put into the 2008/04 folder.

Q: How does Photiso name photo files?
A: Each photo is named with the all the date taken information: '<year>-<month>-<day> <hour>.<minute>.<second>.<millisecond>.<extension>'. 
Example: A photo (.jpg) taken on October 14th, 2006 at exactly 10:02 PM, Photiso would name the photo to 2006-10-14 22.02.00.000.jpg.

Q: Does Photiso ever delete a photo?
No! Photos are either moved to a year/month folder, moved to a duplicates folder, or left where they are.

Q: Why does Photiso organize photos this way?
A: 

Q: How does Photiso determine if a file is a photo?
A: Photiso looks at all files with any of the following extensions: .JPG, .JPEG, .PNG, .BMP, .TIF, .WMP, and .ICO

Q: What does Photiso do with files that are not images.
A: Photiso will skip those files and not move them.

Q: What is an file isn't a photo or doesn't have date taken information?
A: Photiso will use the earliest of the created date or modified date of the image.

Q: What if I have multiple edited versions of my photos with the same date taken?
A: Photiso will detect multiple photos with the same date taken.  
If it is not an exact duplicate, then it appends a revision to the file name.
Example: If there were an edited copy of the same photo, the name would be 2006/10/2006-10-14 22.02.00.000^001.jpg 

Q: What happens if two photos are exact duplicates of each other?
A: Photiso will move the duplicates into the duplicates folder.  
Each set of duplicates is put into a folder named by the signature of its unique content.
Example: A duplicate of a photo is found, and the photo is moved into duplicates/63ae9a44204af9995848cd6211d413f8e32de98214818c354e4128be0b4ef7d4.

Q: How does Photiso name duplicate photo files.
Photos within the duplicates folder will have the same naming as photos in a <year>/<month> folder.

Page 2: Pick photos to organize.

Choose the folder containing the photos you want to organize.  
If you are organizing photos from a device, we recommend copying them to a folder on your computer first.

Page 3:

Page 4:

Page 5:

Page 6:


*/

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

const actionButtonClass = style({   
    padding: "5px 10px",
    minWidth: "200px",
    fontFamily: "Segoe UI Light",
    fontSize: "18pt",
    marginLeft: "10px"
});

export interface AppProps { model: AppModel; }

enum OrganizingStatus {
    Waiting,
    Running,
    Paused,    
}

interface AppState { status: OrganizingStatus, shouldContinue: boolean }

@observer
export class App extends React.Component<AppProps, AppState> {


    constructor(props: AppProps) {
        super(props);
        this.state = {
            status: OrganizingStatus.Waiting,
            shouldContinue: true
        };
    }

    render() {
        const { model } = this.props;

        const renderActionSection = () => {
            switch (this.state.status) {
                case OrganizingStatus.Waiting:
                    return (<div className={actionSectionClass}>                
                        <button className={actionButtonClass} onClick={this.handleStart}>Start</button>
                        <button className={actionButtonClass} onClick={this.handlePause} disabled>Pause</button>
                    </div>);
                    case OrganizingStatus.Running:
                    return (<div className={actionSectionClass}>                
                        <button className={actionButtonClass} onClick={this.handleStop}>Stop</button>
                        <button className={actionButtonClass} onClick={this.handlePause}>Pause</button>
                    </div>);
                    case OrganizingStatus.Paused:
                    return (<div className={actionSectionClass}>                
                        <button className={actionButtonClass} onClick={this.handleStop}>Stop</button>
                        <button className={actionButtonClass} onClick={this.handleStart}>Resume</button>
                    </div>);
            }
        }

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
            {renderActionSection()}
            <Stats model={model} />
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

    private onShouldContinue = (): boolean => {
        return this.state.shouldContinue;
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
            onShouldContinue: this.onShouldContinue,
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

        if (this.state.status === OrganizingStatus.Waiting) {
            this.clearCounts();
        }
        
        this.setState({ status: OrganizingStatus.Running, shouldContinue: true });
        const organizer = createOrganizer(organizerProps);
        await organizer.organize();
        this.setState({ status: OrganizingStatus.Waiting });
    }

    handlePause = () => {
        this.setState({ status: OrganizingStatus.Paused, shouldContinue: false });
    }

    handleStop = () => {
        this.setState({ status: OrganizingStatus.Waiting, shouldContinue: false });
    }
}