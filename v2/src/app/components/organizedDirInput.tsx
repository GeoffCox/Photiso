import { action } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import AppModel from "../models/AppModel";
import { browseDir } from "../browseDir";
import { dirLabelClass, dirClass, browseDirButtonClass, dirInputSection } from "../typeStyles/dirInputTypeStyles";

export interface OrganizedDirInputProps { model: AppModel; }

@observer
export class OrganizedDirInput extends React.Component<OrganizedDirInputProps, {}> {

    render() {
        const { model } = this.props;

        return <div>
            <div className={dirLabelClass}>Organized</div>
            <div className={dirInputSection}>
                <input className={dirClass} value={model.organizedDir} onChange={this.onDirChanged} />
                <button className={browseDirButtonClass} onClick={this.onBrowseDir}>...</button>
            </div>
        </div>;
    }

    @action
    private onBrowseDir = (): void => {
        const dir = browseDir(this.props.model.organizedDir);
        if (dir !== undefined) {
            this.props.model.organizedDir = dir;
        }
    };

    @action
    private onDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.organizedDir = e.currentTarget.value;
    }
}