
import { observer } from "mobx-react";
import * as React from "react";
import * as os from "os";
import * as path from "path";
import AppModel from "../models/AppModel";
import { Stats } from "./Stats"
import { OrganizerActions } from "./OrganizeActions";
import { OrganizedDirInput } from "./OrganizedDirInput";
import { UnorganizedDirInput } from "./UnorganizedDirInput";
import { DuplicatesDirInput } from "./DuplicatesDirInput";
import { Header } from "./Header";
import { loadLastRunInfo, saveLastRunInfo } from "../LastRun";
import { ipcRenderer } from "electron";

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
            <Stats model={model} />
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