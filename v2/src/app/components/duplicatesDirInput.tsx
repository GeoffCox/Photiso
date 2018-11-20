import { action } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import AppModel from "../models/AppModel";
import { browseDir } from "../browseDir";
import { dirLabelClass, dirClass, browseDirButtonClass, dirInputSection } from "../typeStyles/dirInputTypeStyles";

export interface DuplicatesDirInputProps { model: AppModel; }

@observer
export class DuplicatesDirInput extends React.Component<DuplicatesDirInputProps, {}> {

    render() {
        const { model } = this.props;

        return <div>
            <div className={dirLabelClass}>Duplicates</div>
            <div className={dirInputSection}>
                <input className={dirClass} value={model.duplicatesDir} onChange={this.onDirChanged} />
                <button className={browseDirButtonClass} onClick={this.onBrowseDir}>...</button>
            </div>
        </div>;
    }

    @action
    private onBrowseDir = (): void => {
        const dir = browseDir(this.props.model.duplicatesDir);
        if (dir !== undefined) {
            this.props.model.duplicatesDir = dir;
        }
    };

    @action
    private onDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.duplicatesDir = e.currentTarget.value;
    }
}