
import * as React from "react";
import * as path from "path";
import { style } from "typestyle";
import { url } from "csx";

const headerClass = style({
    background: "#333333",
    height: "70px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: "0 0 15px 0"
});

let logoLocation = "file:///" + "static/photiso.png";
if (process.env.NODE_ENV === 'development') {
    logoLocation = "/static/photiso.png";
}

const photisoLogo = style({
    backgroundImage: url(logoLocation),
    width: "42px",
    height: "52px",
    margin: "10px"
});

const headerDescriptionClass = style({
    fontFamily: "Segoe UI Light",
    fontSize: "14pt",
    color: "#A6A6A6",
    margin: "10px"
});

export class Header extends React.Component<{}, {}> {

    render() {
        return <div className={headerClass} title={logoLocation}>
                <div className={photisoLogo}></div>
                <div className={headerDescriptionClass}>Photiso organizes your photos by date taken</div>
            </div>;
    }
}