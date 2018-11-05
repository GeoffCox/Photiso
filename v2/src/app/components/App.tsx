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
        const unorganizedDir = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\unorganized";
        const organizedDir = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\organized";
        const duplicatesDir = "D:\\_Geoff\\GitHub\\Photiso\\v2\\test\\duplicates";

        const organizer = createOrganizer(unorganizedDir, organizedDir, duplicatesDir);
        await organizer.organize();        
    }
}