import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import AppModel from "./models/AppModel";
import { loadLastRunInfo } from "./LastRun";

const model = new AppModel();

const appElement = document.getElementById('app');

const createApp = (AppComponent: typeof App) => 
{
    return (
        <AppComponent model={model}/>
    )
};

ReactDOM.render(
    createApp(App),
    appElement
);

interface NodeModule {
    hot: any;
}

declare var module: NodeModule;

interface NodeRequire {
    <T>(path: string): T;
}

declare var require: NodeRequire;

// Hot Module Replacement APIs
if (module.hot) {
    module.hot.accept('./components/App', () => {
        const NextApp = require<{ App: typeof App }>('./components/App').App;
        ReactDOM.render(createApp(NextApp), appElement);
    });
}