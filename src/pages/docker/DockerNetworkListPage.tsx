import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView, BlockingDialog} from "@core";
import {DockerPage} from "./DockerPage";
import React, {useRef, useState} from "react";
import {NETWORK_LIST} from "@projections/docker-query";
import {NETWORK_CREATE, NETWORK_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {Alert, Button, TextInput, Modal} from "@k8s-cloud-io/react-bootstrap";
import {Modal as BSModal} from "bootstrap";

const DockerNetworkListView = () => {
    const networkNameRef: any = useRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [createDialogVisible, setCreateDialogVisible] = useState(false);
    const [pruneDialogVisible, setPruneDialogVisible] = useState(false);
    const [networkNameError, setNetworkNameError] = useState(null);
    const state = useQuery({
        query: NETWORK_LIST
    })

    const prune = () => {
        setPruneDialogVisible(true);
        state.client.mutate({
            mutation: NETWORK_PRUNE
        }).then(() => {
            setSelectedItems([]);
            const element = document.querySelector('#pruneDialog');
            BSModal.getOrCreateInstance(element).hide();
            state.refresh();
        });
    }

    const createNetwork = () => {
        const name = networkNameRef.current.value?.trim();
        setNetworkNameError(null);
        if( !name?.length ) {
            setNetworkNameError("Invalid network name");
            return;
        }

        state.client.mutate({
            mutation: NETWORK_CREATE,
            variables: {
                name: name,
                driver: "bridge"
            }
        }).then(() => {
            setSelectedItems([]);
            //setCreateDialogVisible(false);
            const element = document.querySelector('#createModal');
            BSModal.getOrCreateInstance(element).hide();
            state.refresh();
        });
    }

    if( state.loading ) {
        return <Alert type={'info'}>Please wait, while loading...</Alert>;
    }

    if( state.error ) {
        return <Alert type={'danger'}>{state.error.message}</Alert>
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
            <Button disabled={selectedItems.length === 0}>
                <span className={'material-icons-outlined text-danger'}>delete</span>
                <span className={'text-danger'}>Delete</span>
            </Button>
            <span className={'flex flex-grow-1'}/>
            <Button className={'btn-primary'} onClick={() => {
                setNetworkNameError(null);
                setCreateDialogVisible(true);
                if( networkNameRef?.current ) {
                    networkNameRef.current.value = "";
                }
            }}>
                <span className={'material-icons-outlined'}>add_box</span>
                <span>Add Network</span>
            </Button>
        </Toolbar>
        <Modal id={'createModal'} show={createDialogVisible} onHide={() => {
            setCreateDialogVisible(false)
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Create Network</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    networkNameError &&
                    <Alert type={'danger'}>{networkNameError}</Alert>
                }
                <div className={'row align-items-center'}>
                    <label className={'form-label fw-400 col-2 m-0'}>Name</label>
                    <div className={'col-10'}>
                        <TextInput ref={networkNameRef} onChange={(e) => {
                            networkNameRef.current.value = e.currentTarget.value;
                        }} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    setCreateDialogVisible(false)
                }}>Cancel</Button>
                <Button className={'btn-primary'} onClick={createNetwork}>Create</Button>
            </Modal.Footer>
        </Modal>
        <BlockingDialog
            title={'Delete Networks'}
            message={'Please wait, until unused networks are deleted...'}
            visible={pruneDialogVisible}
            id={'pruneDialog'}
        />
        <ListView
            onSelectionChange={(items) => setSelectedItems(items)}
            headers={[
                'name', 'driver', 'scope', 'subnet', 'created at'
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
