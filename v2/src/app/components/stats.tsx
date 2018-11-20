
import { observer } from "mobx-react";
import * as React from "react";
import { createOrganizer } from "../organizer";
import AppModel from "../models/AppModel";
import { action } from "mobx";
import { style } from "typestyle";
import electron = require("electron");
import { url } from "csx";

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

const statLabelClass = style({
    fontFamily: "Segoe UI Light",
    fontSize: "18pt",
    flexGrow: 0
});

export interface StatsProps { model: AppModel; }

enum OrganizingStatus {
    Waiting,
    Running,
    Paused,    
}

@observer
export class Stats extends React.Component<StatsProps, {}> {

    // renders a row of statistics from organizing photos
    render() {
        const { model } = this.props;

        return (<div className={statSectionClass}>
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
        </div>);
    }
}