import * as React from "react";
import { createOrganizer } from "../Organizer";


export interface AppProps { compiler: string; framework: string; }

export class App extends React.Component<AppProps, {}> {
    render() {
        return <div>
            <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
            <button onClick={this.handleRun}>Run</button>
        </div>;
    }

    handleRun = async () => {
        const props = {
            unorganizedDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\unorganized",
            organizedDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\organized",
            duplicatesDir: "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\duplicates",
            onStartedDir: (dir: string): void => {
                console.log(`Started directory: ${dir}`);
            },
            onFinishedDir: (dir: string): void => {
                console.log(`Finished directory: ${dir}`);
            },
            onNoOp: (file: string): void => {
                console.log(`No-Op: ${file}`);
            },
            onSkipped: (file: string): void => {
                console.log(`Skipped: ${file}`);
            },
            onMoved: (fromFile: string, toFile: string): void => {
                console.log(`Moved: ${fromFile} -> ${toFile}`);
            },
            onDuplicateMoved: (fromFile: string, toFile): void => {
                console.log(`Duplicate: ${fromFile} -> ${toFile}`);
            },
            onDuplicateNoOp: (file: string): void => {
                console.log(`Duplicate: ${file}`);
            },
            onError: (file: string, error: Error): void => {
                console.log(`Error: ${file} ${error}`);
            }
        };

        const organizer = createOrganizer(props);
        await organizer.organize();
    }
}