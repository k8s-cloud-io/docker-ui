import {useQuery} from "@k8s-cloud-io/react-graphql";
import {BlockingDialog, Button, ErrorDialog, ListView, Page, Toolbar} from "@core";
import {DockerPage} from "./DockerPage";
import React, {createRef, RefObject, useEffect, useState} from "react";
import {NETWORK_LIST} from "@projections/docker-query";
import {NETWORK_PRUNE, NETWORK_DELETE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {Alert, Modal} from "react-bootstrap";
import {useNavigate} from "@k8s-cloud-io/react-router";
import {LabelRenderer} from "./partials/LabelRenderer";

const DockerNetworkListView = () => {
    const listRef: RefObject<any> = createRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [pruneDialogVisible, setPruneDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();
    const state = useQuery({
        query: NETWORK_LIST
    })

    const prune = () => {
        setPruneDialogVisible(true);
        state.client.mutate({
            mutation: NETWORK_PRUNE
        }).then(() => {
            setPruneDialogVisible(false);
            state.refresh();
        });
    }

    const deleteNetworks = () => {
        setDeleteDialogVisible(false)
        setPruneDialogVisible(true)
        state.client.mutate({
            mutation: NETWORK_DELETE,
            variables: {
                networks: selectedItems.map(item => item.id)
            }
        }).then(() => {
            setPruneDialogVisible(false)
            state.refresh();
        }).catch(e => {
            setPruneDialogVisible(false)
            setErrorMessage(e.extensions['debugMessage'] || e.message);
            state.refresh();
        });
    }

    useEffect(() => {
        if( selectedItems.length && !state.loaded ) {
            setSelectedItems([]);
        }
    }, [state.loaded]);

    if( state.loading ) {
        return <Alert variant={'info'}>Please wait, while loading...</Alert>;
    }

    if( state.error ) {
        return <Alert variant={'danger'}>{state.error.message}</Alert>
    }

    return <>
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
            <Button disabled={selectedItems.length === 0} onClick={() => setDeleteDialogVisible(true)}>
                <span className={'material-icons-outlined text-danger'}>delete</span>
                <span className={'text-danger'}>Delete</span>
            </Button>
            <span className={'flex flex-grow-1'}/>
            <Button className={'btn-primary'} onClick={() => {
                navigate('/docker/networks/create');
            }}>
                <span className={'material-icons-outlined'}>add_box</span>
                <span>Add Network</span>
            </Button>
        </Toolbar>
        <BlockingDialog
            title={'Delete Networks'}
            message={'Please wait, until unused networks are deleted...'}
            visible={pruneDialogVisible}
            id={'pruneDialog'}
        />
        <Modal show={deleteDialogVisible} id={'deleteDialog'} onHide={() => setDeleteDialogVisible(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Networks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Do you really want to delete the selected networks?
            </Modal.Body>
            <Modal.Footer>
                <Button data-bs-dismiss={'modal'}>Cancel</Button>
                <Button className={'btn-danger'} onClick={deleteNetworks}>Delete</Button>
            </Modal.Footer>
        </Modal>
        <ErrorDialog message={errorMessage} visible={errorMessage !== null} onHide={() => setErrorMessage(null)}/>
        <ListView
            ref={listRef}
            onSelectionChange={(items) => setSelectedItems(items)}
            headers={[
                'name', 'driver', 'scope', 'subnet', 'labels', 'created at'
            ]}
            fields={{
                name: (value: any) => {
                    return value['name'];
                },
                driver: (value: any) => {
                    return value['driver'];
                },
                scope: (value: any) => {
                    return value['scope'];
                },
                subnet: (value: any) => {
                    if( value['iPAM']['config']?.length ) {
                       return value['iPAM']['config'].map( (item:any) => {
                           return <span className={'flex p-0'}>{item['subnet']}</span>
                       });
                    }

                    return null;
                },
                labels: (value: any) => {
                    return <LabelRenderer labels={value} />
                },
                created: (value: any) => {
                    return dayjs(value.created).format("YYYY-MM-DD HH:mm:ss")
                }
            }}
            checkable
            items={state.data['networks']}
        />
    </>
}

export const DockerNetworkListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Networks'}>
            <DockerNetworkListView />
        </DockerPage>
    </Page>
}
