import { style } from "typestyle";

export const dirLabelClass = style({
    fontFamily: "Segoe UI Light",
    fontSize: "16pt",
    margin: "5px 0 5px 0"
});

export const dirInputSection = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    
});

export const dirClass = style({
    flexGrow: 1,    
    fontFamily: "Segoe UI Light",
    fontSize: "12pt",
    display: "inline-block",
    padding: "5px"
});

export const browseDirButtonClass = style({
    flexGrow: 0,
    display: "inline-block",
    fontFamily: "Segoe UI Light",
    fontSize: "12pt",
    margin: "0 0 0 -1px",
    minWidth: "50px",
    padding: "5px"
});
