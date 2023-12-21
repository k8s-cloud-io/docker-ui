import React, {useEffect, useState} from "react";
import {Alert, OffCanvas} from "@k8s-cloud-io/react-bootstrap";
import {ImageDetailsProps, LoadingProps} from "./props";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {IMAGE_DETAILS} from "@projections/docker-query";

export const ImageListDetails = (props: ImageDetailsProps) => {
    if( !props.id ) return null;

    const client = useGraphQLClient();
    const [state, setState ] = useState<LoadingProps>({
        loaded: false,
        loading: true,
        data: null,
        error: null
    });

    useEffect(() => {
        if( !state.loaded ) {
            client.query({
                query: IMAGE_DETAILS,
                variables: {
                    id: props.id
                }
            })
                .then( result => {
                    setState({
                        ...state,
                        loading: false,
                        loaded: true,
                        data: result.image
                    })
                })
                .catch( error => {
                    setState({
                        ...state,
                        loading: false,
                        loaded: true,
                        error: error.message
                    })
                })
        }
    }, []);

    return <OffCanvas direction={'end'} show={props.visible} onHide={props.onHide}>
        <OffCanvas.Header closeButton>
            <OffCanvas.Title>{props.name} ({props.version})</OffCanvas.Title>
        </OffCanvas.Header>
        <OffCanvas.Body>
            {
                state.loading &&
                <Alert type={'info'}>
                    Please wait, while loading...
                </Alert>
            }
            {
                state.error &&
                <Alert type={'danger'}>
                    {state.error}
                </Alert>
            }
            {
                state.data &&
                <table className={'table data-table table-bordered small'}>

                </table>
            }
        </OffCanvas.Body>
    </OffCanvas>
}
