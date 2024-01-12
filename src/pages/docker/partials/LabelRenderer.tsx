import React from "react";
import {LabelObject} from "../props";

export const LabelRenderer = (props: {labels: LabelObject}) => {
    return Object.keys(props.labels || {}).map( key => {
        return <span className={'d-block'}>
            {key}: {props.labels[key]}
        </span>
    });
}