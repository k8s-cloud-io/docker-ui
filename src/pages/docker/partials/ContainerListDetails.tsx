import {OffCanvas} from "@k8s-cloud-io/react-bootstrap";
import React from "react";

type ContainerListDetailsProps = {
    visible: boolean,
    onHide?: () => void
    data: any
}

export const ContainerListDetails = (props: ContainerListDetailsProps) => {
    const containerName = props.data ? props.data['names'][0].substring(1) : null;
    return <OffCanvas direction={'end'} show={props.visible} onHide={props.onHide}>
        <OffCanvas.Header closeButton>
            <OffCanvas.Title>{containerName}</OffCanvas.Title>
        </OffCanvas.Header>
        <OffCanvas.Body>
            CONTENT COMES HERE
        </OffCanvas.Body>
    </OffCanvas>
}