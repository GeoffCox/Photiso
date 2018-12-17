import { action } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import AppModel from "../models/AppModel";
import { browseDir } from "../browseDir";
import { dirLabelClass, dirClass, browseDirButtonClass, dirInputSection } from "../typeStyles/dirInputTypeStyles";

export interface UnorganizedDirInputProps { model: AppModel; }

@observer
export class UnorganizedDirInput extends React.Component<UnorganizedDirInputProps, {}> {

    render() {
        const { model } = this.props;

        return <div>
            <div className={dirLabelClass}>Source folder containing unorganized photos</div>
            <div className={dirInputSection}>
                <input className={dirClass} value={model.unorganizedDir} onChange={this.onDirChanged} />
                <button className={browseDirButtonClass} onClick={this.onBrowseDir}>...</button>
            </div>
        </div>;
    }

    @action
    private onBrowseDir = (): void => {
        const dir = browseDir(this.props.model.unorganizedDir);
        if (dir !== undefined) {
            this.props.model.unorganizedDir = dir;
        }
    };

    @action
    private onDirChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.model.unorganizedDir = e.currentTarget.value;
    }
}