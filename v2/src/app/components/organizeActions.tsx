
import { observer } from "mobx-react";
import * as React from "react";
import { createOrganizer } from "../organizer";
import AppModel, { OrganizerStatus } from "../models/AppModel";
import { action } from "mobx";
import { style } from "typestyle";
import electron = require("electron");

const actionSectionClass = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    margin: "20px 10px"
});

const actionButtonClass = style({
    padding: "5px 10px",
    minWidth: "200px",
    fontFamily: "Segoe UI Light",
    fontSize: "18pt",
    marginLeft: "10px"
});

export interface OrganizerActionsProps { model: AppModel; }

interface OrganizerActionsState { shouldContinue: boolean }

@observer
export class OrganizerActions extends React.Component<OrganizerActionsProps, OrganizerActionsState> {


    constructor(props: OrganizerActionsProps) {
        super(props);
        this.state = {
            shouldContinue: true
        };
    }

    render() {
        const { model } = this.props;

        switch (model.status) {
            case OrganizerStatus.Waiting:
                return (<div className={actionSectionClass}>
                    <button className={actionButtonClass} onClick={this.handleStart}>Start</button>
                </div>);
            case OrganizerStatus.Running:
                return (<div className={actionSectionClass}>
                    <button className={actionButtonClass} onClick={this.handleStop}>Stop</button>
                </div>);
        }
    }

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
        console.log(`  ${file}`);
        this.props.model.fileCount++;

    };

    @action
    private onFinishedFile = (file: string): void => {
    };

    @action
    private onNoOp = (file: string): void => {
        console.log(`    => no-op)`);
    };

    @action
    private onSkipped = (file: string): void => {
        console.log(`    => skipped`);
        this.props.model.skippedCount++;
    };

    @action
    private onMoved = (fromFile: string, toFile: string): void => {
        console.log(`    => moved: ${toFile}`);
        this.props.model.organizedCount++;
    };

    @action
    private onDuplicateMoved = (fromFile: string, toFile): void => {
        console.log(`    => duplicate: ${toFile}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onDuplicateNoOp = (file: string, hash: string): void => {
        console.log(`    => duplicate no-op: ${file} ${hash}`);
        this.props.model.duplicatesCount++;
    };

    @action
    private onError = (file: string, error: Error): void => {
        console.log(`    => error: ${file} ${error}`);
        this.props.model.errorCount++;
    };

    @action
    private clearCounts = (): void => {
        const { model } = this.props;
        model.fileCount = 0;
        model.organizedCount = 0;
        model.duplicatesCount = 0;
        model.skippedCount = 0;
        model.errorCount = 0;
    }

    @action
    handleStart = async () => {
        const { model, model: { status, unorganizedDir, organizedDir, duplicatesDir } } = this.props;
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

        if (status === OrganizerStatus.Waiting) {
            this.clearCounts();
        }

        this.setState({ shouldContinue: true });
        model.status = OrganizerStatus.Running;

        const organizer = createOrganizer(organizerProps);
        await organizer.organize();

        if (model.status === OrganizerStatus.Running) {
            model.status = OrganizerStatus.Waiting;
        }
    }

    @action
    handleStop = () => {
        this.setState({ shouldContinue: false });
        this.props.model.status = OrganizerStatus.Waiting;
    }
}