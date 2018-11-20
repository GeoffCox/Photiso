
import * as React from "react";
import { style } from "typestyle";
import { url } from "csx";

const headerClass = style({
    background: "#333333",
    height: "75px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
});

const photisoLogo = style({
    backgroundImage: url("/static/photiso.png"),
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
        return <div className={headerClass}>
                <div className={photisoLogo}></div>
                <div className={headerDescriptionClass}>Photiso organizes your photos by date taken into year/month folders</div>
            </div>;
    }
}