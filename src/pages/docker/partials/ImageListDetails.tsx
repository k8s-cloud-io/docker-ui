import React from "react";
import {OffCanvas} from "@k8s-cloud-io/react-bootstrap";

type ImageDetailsProps = {
    id: string,
    name: string,
    version: string,
    visible: boolean,
    onHide: () => void
}
export const ImageListDetails = (props: ImageDetailsProps) => {
    return <OffCanvas direction={'end'} show={props.visible} onHide={props.onHide}>
        <OffCanvas.Header closeButton>
            <OffCanvas.Title>{props.name} ({props.version})</OffCanvas.Title>
        </OffCanvas.Header>
        <OffCanvas.Body>
            CONTENT COMES HERE
        </OffCanvas.Body>
    </OffCanvas>
}
