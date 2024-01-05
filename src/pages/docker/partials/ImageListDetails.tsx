import React, {useEffect, useState} from "react";
import {ImageDetailsProps, LoadingProps} from "./props";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {IMAGE_DETAILS} from "@projections/docker-query";
import dayjs from "dayjs";
import {bytesToSize} from "@core/utils";
import {Alert, Offcanvas} from "react-bootstrap";

export const ImageListDetails = (props: ImageDetailsProps) => {
    const client = useGraphQLClient();
    const [state, setState ] = useState<LoadingProps>({
        loaded: false,
        loading: true,
        data: null,
        error: null
    });

    useEffect(() => {
        if( props.id ) {
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
    }, [props.id]);

    const closeCanvas = () => {
        props.onHide();
    }

    return <Offcanvas placement={'end'} show={props.visible} onHide={closeCanvas}>
        {
            props.name &&
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{props.name} ({props.version})</Offcanvas.Title>
            </Offcanvas.Header>
        }
        <Offcanvas.Body>
            {
                state.loading &&
                <Alert variant={'info'}>
                    Please wait, while loading...
                </Alert>
            }
            {
                state.error &&
                <Alert variant={'danger'}>
                    {state.error}
                </Alert>
            }
            {
                state.data &&
                <>
                    <h6 className={'mb-3'}>General</h6>
                    {
                        state.data['comment'] &&
                        <div className={'mb-2 text-secondary'}><i>{state.data['comment']}</i></div>
                    }
                    <table className={'table data-table table-bordered small'}>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>created</th>
                            <td className={'border-1 ps-2 pe-2'}>{dayjs(state.data['created']).format('YYYY-MM-DD HH:mm:ss')}</td>
                        </tr>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>size</th>
                            <td className={'border-1 ps-2 pe-2'}>{bytesToSize(state.data.size)}</td>
                        </tr>
                    </table>
                    <h6 className={'mb-3'}>Executable</h6>
                    <table className={'table data-table table-bordered small'}>
                        {
                            state.data.config['cmd'] &&
                            <tr>
                                <th className={'bg-light border-1 ps-2 pe-2'}>CMD</th>
                                <td className={'border-1 ps-2 pe-2'}>{state.data.config['cmd'].map( (command: string) => {
                                    return <div className={'p-0'}>{command}</div>
                                })}</td>
                            </tr>
                        }
                        {
                            state.data.config['entrypoint'] &&
                            <tr>
                                <th className={'bg-light border-1 ps-2 pe-2'}>Entry Point</th>
                                <td className={'border-1 ps-2 pe-2'}>{state.data.config['entrypoint'].map( (ep: string) => {
                                    return <div className={'p-0'}>{ep}</div>
                                })}</td>
                            </tr>
                        }
                    </table>
                    {
                        (state.data.config['hostname'] || state.data.config['domainname'] || state.data.config['exposedPorts']) &&
                        <>
                            <h6 className={'mb-3'}>Networking</h6>
                            <table className={'table data-table table-bordered small'}>
                                {
                                    state.data.config['hostname'] &&
                                    <tr>
                                        <th className={'bg-light border-1 ps-2 pe-2'}>Hostname</th>
                                        <td className={'border-1 ps-2 pe-2'}>{state.data.config['hostname']}</td>
                                    </tr>
                                }
                                {
                                    state.data.config['domainname'] &&
                                    <tr>
                                        <th className={'bg-light border-1 ps-2 pe-2'}>Hostname</th>
                                        <td className={'border-1 ps-2 pe-2'}>{state.data.config['domainname']}</td>
                                    </tr>
                                }
                                {
                                    state.data.config['exposedPorts'] &&
                                    <tr>
                                        <th className={'bg-light border-1 ps-2 pe-2'}>Exposed Ports</th>
                                        <td className={'border-1 ps-2 pe-2'}>{Object.keys(state.data.config['exposedPorts']).map (key => {
                                            return <span className={'flex p-0'}>{key}</span>
                                        })}</td>
                                    </tr>
                                }
                            </table>
                        </>
                    }
                    {
                        state.data.config.env && state.data.config.env?.length > 0 &&
                        <>
                            <h6 className={'mb-3'}>Environment</h6>
                            <table className={'table data-table table-bordered small'}>
                                <tr>
                                    <th className={'bg-light border-1 ps-2 pe-2 vertical-align-top'}>Environment</th>
                                    <td className={'border-1 ps-2 pe-2 vertical-align-top'}>{
                                        state.data.config.env.map( (keyPair:any) => {
                                            return <div className={'p-0'}>{keyPair}</div>
                                        })
                                    }</td>
                                </tr>
                            </table>
                        </>
                    }
                    {
                        state.data.config['volumes'] &&
                        <>
                            <h6 className={'mb-3'}>Volumes</h6>
                            <table className={'table data-table table-bordered small'}>
                                <tr>
                                    <th className={'bg-light border-1 ps-2 pe-2 vertical-align-top'}>Volumes</th>
                                    <td className={'border-1 ps-2 pe-2 vertical-align-top'}>{
                                        Object.keys(state.data.config['volumes']).map( (volume:any) => {
                                            return <div className={'p-0'}>{volume}</div>
                                        })
                                    }</td>
                                </tr>
                            </table>
                        </>
                    }
                </>
            }
        </Offcanvas.Body>
    </Offcanvas>
}
