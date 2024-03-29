import React, { useEffect, useState} from "react";
import {ContainerListDetailsProps, LoadingProps} from "./props";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {CONTAINER_DETAILS} from "@projections/docker-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Alert, Offcanvas} from "react-bootstrap";
import {LabelRenderer} from "./LabelRenderer";

dayjs.extend(relativeTime);
export const ContainerListDetails = (props: ContainerListDetailsProps) => {
    const containerName = props.data;

    const client = useGraphQLClient();
    const [state, setState ] = useState<LoadingProps>({
        loaded: false,
        loading: true,
        data: null,
        error: null
    });

    useEffect(() => {
        if( containerName) {
            client.query({
                query: CONTAINER_DETAILS,
                variables: {
                    id: containerName
                }
            })
                .then( result => {
                    setState({
                        ...state,
                        loading: false,
                        loaded: true,
                        data: result.container
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
    }, [containerName]);

    const closeCanvas = () => {
        props.onHide()
    }

    return <Offcanvas placement={'end'} show={props.visible} onHide={closeCanvas}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>{containerName}</Offcanvas.Title>
        </Offcanvas.Header>
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
                    <table className={'table data-table table-bordered'}>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>created</th>
                            <td className={'border-1 ps-2 pe-2'}>{dayjs(state.data.created).format("YYYY-MM-DD HH:mm:ss")}</td>
                        </tr>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>image</th>
                            <td className={'border-1 ps-2 pe-2'}>{state.data.config.image}</td>
                        </tr>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>state</th>
                            <td className={'border-1 ps-2 pe-2'}>{state.data.state.status}</td>
                        </tr>
                        {
                            state.data.state.status === 'running' &&
                            <>
                                <tr>
                                    <th className={'bg-light border-1 ps-2 pe-2'}>started at</th>
                                    <td className={'border-1 ps-2 pe-2'}>{dayjs(state.data.state['startedAt']).format("YYYY-MM-DD HH:mm:ss")}</td>
                                </tr>
                                <tr>
                                    <th className={'bg-light border-1 ps-2 pe-2'}>uptime</th>
                                    <td className={'border-1 ps-2 pe-2'}>{dayjs(state.data.state['startedAt']).fromNow(true)}</td>
                                </tr>
                            </>
                        }
                        {
                            Object.keys(state.data.config.labels || {}).length > 0 &&
                            <>
                                <tr>
                                    <th className={'bg-light border-1 ps-2 pe-2'}>Labels</th>
                                    <td className={'border-1 ps-2 pe-2'}>
                                        <LabelRenderer labels={state.data.config.labels} />
                                    </td>
                                </tr>
                            </>
                        }
                    </table>
                    <h6 className={'mb-3'}>Networking</h6>
                    <table className={'table data-table table-bordered'}>
                        <tr>
                            <th className={'bg-light border-1 ps-2 pe-2'}>Hostname</th>
                            <td className={'border-1 ps-2 pe-2'}>{state.data.config.hostname}</td>
                        </tr>
                    {
                        state.data['networkSettings']['networks'] &&
                        Object.keys(state.data['networkSettings']['networks']).map( name => {
                            return <tr>
                                <th className={'bg-light border-1 ps-2 pe-2'}>Network {name}</th>
                                <td className={'border-1 ps-2 pe-2'}>
                                    {state.data['networkSettings']['networks'][name]['iPAddress']}
                                </td>
                            </tr>
                        })
                    }
                    </table>
                    {
                        state.data['config']['env'] &&
                        <>
                            <h6 className={'mb-3'}>Environment</h6>
                            <table className={'table data-table table-bordered'}>
                                {
                                    state.data['config']['env'].map( (env: string) => {
                                        const parts = env.split("=");
                                        return <tr>
                                            <th className={'bg-light border-1 ps-2 pe-2'}>{parts[0].trim()}</th>
                                            <td className={'border-1 ps-2 pe-2'}>
                                                {parts[1].trim()}
                                            </td>
                                        </tr>
                                    })
                                }
                            </table>
                        </>
                    }
                </>
            }
        </Offcanvas.Body>
    </Offcanvas>
}