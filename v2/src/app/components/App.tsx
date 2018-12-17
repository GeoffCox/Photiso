
import { observer } from "mobx-react";
import * as React from "react";
import * as os from "os";
import * as path from "path";
import AppModel from "../models/AppModel";
import { StatsBar } from "./StatsBar"
import { OrganizerActions } from "./OrganizeActions";
import { OrganizedDirInput } from "./OrganizedDirInput";
import { UnorganizedDirInput } from "./UnorganizedDirInput";
import { DuplicatesDirInput } from "./DuplicatesDirInput";
import { Header } from "./Header";
import { loadLastRunInfo, saveLastRunInfo } from "../LastRun";
import { ipcRenderer } from "electron";

export interface AppProps { model: AppModel; }

@observer
export class App extends React.Component<AppProps, {}> {

    private windowClosing = false;

    constructor(props: AppProps) {
        super(props);

        // register with ipcMain so it can let us know 
        // when the window close button is clicked vs. a dev force reload.
        ipcRenderer.send('register-app-renderer');

        ipcRenderer.on('main-close-window', (event, arg) => {
            console.log('main-close-window');
            this.windowClosing = true;
        });

        const { model } = props;
        loadLastRunInfo().then(info => {
            if (info !== undefined) {
                model.unorganizedDir = info.unorganizedDir;
                model.organizedDir = info.organizedDir;
                model.duplicatesDir = info.duplicatesDir;
            }
            else {
                const pictureDir = path.join(os.homedir(), 'pictures');
                model.unorganizedDir = path.join(pictureDir, 'unorganized')
                model.organizedDir = path.join(pictureDir, 'organized')
                model.duplicatesDir = path.join(pictureDir, 'duplicates')
            }
        });
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onBeforeUnload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onBeforeUnload);
    }

    render() {
        const { model } = this.props;

        return <div>
            <Header />
            <UnorganizedDirInput model={model} />
            <OrganizedDirInput model={model} />
            <DuplicatesDirInput model={model} />
            <OrganizerActions model={model} />
            <StatsBar model={model} />
        </div>;
    }

    private readyToClose = false;

    private onBeforeUnload = (e: any) => {

        // if the window is closing then we want to ensure we saved the last run information
        if (this.windowClosing) {
            if (!this.readyToClose) {
                setTimeout(() => {
                    try {
                        const { model } = this.props;
                        saveLastRunInfo({
                            unorganizedDir: model.unorganizedDir,
                            organizedDir: model.organizedDir,
                            duplicatesDir: model.duplicatesDir
                        }).then(() => {
                            this.readyToClose = true;
                            window.close();
                        });
                    }
                    catch (error) {
                        console.log(error);
                        this.readyToClose = true;
                        window.close();
                    }
                }, 500);

                
                e.returnValue = 'Please wait...';
            }
        }

    };


}