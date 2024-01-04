import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView, BlockingDialog, Button} from "@core";
import {DockerPage} from "./DockerPage";
import React, {createRef, forwardRef, RefObject, useRef, useState} from "react";
import {CONTAINER_LIST} from "@projections/docker-query";
import {CONTAINER_PRUNE, CONTAINER_RESTART, CONTAINER_START, CONTAINER_STOP} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {ContainerListDetails} from "./partials/ContainerListDetails";
import {Alert, Dropdown} from "react-bootstrap";

const ActionToggle = forwardRef((props: any, ref: any) => {
    return <span ref={ref} className={'material-icons-outlined cursor-pointer'} onClick={(e) => {
        e.preventDefault();
        props.onClick(e);
    }}>
        more_vert
    </span>
});

const DockerContainerListView = () => {
    const listRef: RefObject<any> = createRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState(null)
    const [startDialogVisible, setStartDialogVisible] = useState(false);
    const [stopDialogVisible, setStopDialogVisible] = useState(false);
    const [restartDialogVisible, setRestartDialogVisible] = useState(false);
    const state = useQuery({
        query: CONTAINER_LIST
    })

    const refresh = () => {
        if( listRef.current )
            listRef.current.unSelect();

        setStartDialogVisible(false);
        setRestartDialogVisible(false);
        setStopDialogVisible(false);
        state.refresh();
    }

    const prune = () => {
        state.client.mutate({
            mutation: CONTAINER_PRUNE
        }).then(() => {
            refresh();
        });
    }

    const startContainer = (id: string) => {
        setStartDialogVisible(true);
        state.client.mutate({
            mutation: CONTAINER_START,
            variables: {
                id
            }
        }).then(() => {
            refresh();
        });
    }

    const stopContainer = (id: string) => {
        setStopDialogVisible(true)
        state.client.mutate({
            mutation: CONTAINER_STOP,
            variables: {
                id
            }
        }).then(() => {
            refresh();
        });
    }

    const restartContainer = (id: string) => {
        setRestartDialogVisible(true);
        state.client.mutate({
            mutation: CONTAINER_RESTART,
            variables: {
                id
            }
        }).then(() => {
            refresh();
        });
    }

    if( state.error ) {
        return <Alert variant={'danger'}>{state.error.message}</Alert>
    }

    return <>
        {
            state.loading &&
            <Alert variant={'info'}>Please wait, while loading...</Alert>
        }
        <BlockingDialog
            id={'startContainerDialog'}
            title={'Start Container'}
            message={'Please wait, while container is starting...'}
            visible={startDialogVisible}
            onHide={() => setStartDialogVisible(false)}
        />
        <BlockingDialog
            id={'restartContainerDialog'}
            title={'Restart Container'}
            message={'Please wait, while container is restarting...'}
            visible={restartDialogVisible}
            onHide={() => setRestartDialogVisible(false)}
        />
        <BlockingDialog
            id={'stopContainerDialog'}
            title={'Stop Container'}
            message={'Please wait, while container is stopping...'}
            visible={stopDialogVisible}
            onHide={() => setStopDialogVisible(false)}
        />
        {
            !state.loading &&
            <>
                <Toolbar>
                    <Button onClick={() => {setSelectedItems([]); state.refresh()}}>
                        <span className={'material-icons-outlined text-primary'}>refresh</span>
                        <span>Refresh</span>
                    </Button>
                    <Button onClick={prune}>
                        <span className="material-icons-outlined text-primary">
                            cleaning_services
                        </span>
                        <span>Prune</span>
                    </Button>
                    <Button disabled={selectedItems.length === 0}>
                        <span className={'material-icons-outlined text-danger'}>delete</span>
                        <span className={'text-danger'}>Delete</span>
                    </Button>
                </Toolbar>
                <ListView
                    ref={listRef}
                    onSelectionChange={(items) => setSelectedItems(items)}
                    headers={[
                        'name', 'image', 'ip address', 'ports', 'state', 'created at', ''
                    ]}
                    fields={{
                        name: (value: any) => {
                            let name = value['names'][0];
                            if( name.startsWith('/'))
                                name = name.substring(1);
                            return <span className={'link-primary'} onClick={() => {
                                setDetailsVisible(() => {
                                    setSelectedContainer(value);
                                    return true;
                                });
                            }}>{name}</span>;
                        },
                        image: (value: any) => {
                            let image = value['image'];
                            if( image.startsWith('sha256:')) {
                                image = '<unknown>';
                            }
                            return image;
                        },
                        ip: (value: any) => {
                            const ipList = [];
                            // only running containers can have an ip address
                            if( value['state'] === 'running' ) {
                                const networks = value['networkSettings']['networks'];
                                Object.keys(networks).forEach(networkName => {
                                    const network = networks[networkName];
                                    ipList.push(<div>{network['iPAddress']}</div>)
                                })
                            }
                            return ipList;
                        },
                        ports: (value: any) => {
                            const ports = [];
                            if( value['ports'] ) {
                                value['ports'].forEach( (port: any) => {
                                    const conf = `${port['privatePort']}${port['publicPort'] ? ':'.concat(port['publicPort']) : ''}/${port['type']}`;
                                    ports.push(<div>{conf}</div>)
                                })
                            }
                            return ports;
                        },
                        state: (value: any) => {
                            return value['state'];
                        },
                        created: (value: any) => {
                            return dayjs(value.created * 1000).format("YYYY-MM-DD HH:mm:ss")
                        },
                        action: (value: any) => {
                            return <Dropdown>
                                <Dropdown.Toggle as={ActionToggle}/>
                                <Dropdown.Menu>
                                    {
                                        value.state !== 'running' &&
                                        <Dropdown.Item onClick={() => {
                                            startContainer(value.id)
                                        }}>
                                            <span className={'material-icons-outlined me-2 fs-5 text-primary'}>play_circle</span>
                                            <span>Start</span>
                                        </Dropdown.Item>
                                    }
                                    {
                                        value.state === 'running' &&
                                        <>
                                            <Dropdown.Item onClick={() => {
                                                stopContainer(value.id)
                                            }}>
                                                <span className={'material-icons-outlined me-2 fs-5 text-primary'}>stop_circle</span>
                                                <span>Stop</span>
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => {
                                                restartContainer(value.id)
                                            }}>
                                                <span className={'material-icons-outlined me-2 fs-5 text-primary'}>refresh</span>
                                                <span>Restart</span>
                                            </Dropdown.Item>
                                        </>
                                    }
                                    <Dropdown.Item>
                                        <span className={'material-icons-outlined me-2 fs-5 text-primary'}>settings</span>
                                        <span>Settings</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <span className={'material-icons-outlined me-2 fs-5 text-danger'}>delete</span>
                                        <span>Delete Container</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        }
                    }}
                    checkable
                    items={state.data['containers']}
                />
                {
                    detailsVisible &&
                    <ContainerListDetails visible={true} data={selectedContainer} onHide={() => {
                        setDetailsVisible(() => {
                            setSelectedContainer(null);
                            return false;
                        })
                    }}/>
                }
            </>
        }
    </>
}

export const DockerContainerListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Containers'}>
            <DockerContainerListView />
        </DockerPage>
    </Page>
}
