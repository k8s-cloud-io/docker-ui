import {OffCanvas} from "@k8s-cloud-io/react-bootstrap";
import React, {useCallback, useEffect, useState} from "react";
import {ContainerListDetailsProps, LoadingProps} from "./props";

export const ContainerListDetails = (props: ContainerListDetailsProps) => {
    const containerName = props.data ? props.data['names'][0].substring(1) : null;
    const [state, setState ] = useState<LoadingProps>({
        loaded: false,
        loading: false,
        data: null,
        error: null
    });

    const loadDetails = useCallback(() => {
        if( props.data && !state.loaded ) {
            setState({
                ...state,
                loading: true
            })
        }
    }, [])

    useEffect(() => {
        loadDetails();
    }, [state.loaded, state.loading]);

    return <OffCanvas direction={'end'} show={props.visible} onHide={props.onHide}>
        <OffCanvas.Header closeButton>
            <OffCanvas.Title>{containerName}</OffCanvas.Title>
        </OffCanvas.Header>
        <OffCanvas.Body>
            CONTENT COMES HERE
        </OffCanvas.Body>
    </OffCanvas>
}