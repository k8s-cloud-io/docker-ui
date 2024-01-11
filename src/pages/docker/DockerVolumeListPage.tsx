import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView, Button, ErrorDialog, BlockingDialog} from "@core";
import {DockerPage} from "./DockerPage";
import React, {createRef, RefObject, useEffect, useRef, useState} from "react";
import {VOLUME_LIST} from "@projections/docker-query";
import {VOLUME_DELETE, VOLUME_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {Alert, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";

const DockerVolumeListView = () => {
    const listRef: RefObject<any> = createRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [blockingDialogVisible, setBlockingDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const state = useQuery({
        query: VOLUME_LIST
    })

    const prune = () => {
        state.client.mutate({
            mutation: VOLUME_PRUNE
        }).then(() => {
            listRef.current.unSelect();
            state.refresh();
        });
    }

    const deleteVolumes = () => {
        setDeleteDialogVisible(false);
        setBlockingDialogVisible(true);
        state.client.mutate({
            mutation: VOLUME_DELETE,
            variables: {
                volumes: selectedItems.map( item => item.name)
            }
        })
            .then(() => {
                setBlockingDialogVisible(false);
                state.refresh();
            })
            .catch(e => {
                setBlockingDialogVisible(false);
                setErrorMessage(e.extensions['debugMessage'] || e.message);
                state.refresh();
            });
    }

    const hideErrorDialog = () => {
        setErrorMessage(null);
    }

    const showDeleteDialog = () => {
        setDeleteDialogVisible(true);
    }

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
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
            <Button disabled={selectedItems.length === 0} onClick={showDeleteDialog}>
                <span className={'material-icons-outlined text-danger'}>delete</span>
                <span className={'text-danger'}>Delete</span>
            </Button>
        </Toolbar>
        <ListView
            ref={listRef}
            onSelectionChange={(items) => setSelectedItems(items)}
            headers={[
                'name', 'labels', 'created at'
            ]}
            fields={{
                name: (value: any) => {
                    return value.name;
                },
                labels: (value: any) => {
                    return Object.keys(value['labels'] || {}).map( key => {
                        return <span>
                                    {key}: {value['labels'][key]}
                                </span>
                    });
                },
                created: (value: any) => {
                    return dayjs(value['createdAt']).format("YYYY-MM-DD HH:mm:ss")
                }
            }}
            checkable
            items={state.data['volumes']}
        />
        <ErrorDialog message={errorMessage} visible={errorMessage !== null} onHide={hideErrorDialog}/>
        <BlockingDialog
            title={'Delete Volumes'}
            message={'Please wait, while selected volumes are deleted...'}
            visible={blockingDialogVisible}
            onHide={() => setBlockingDialogVisible(false)}
        />
        <Modal show={deleteDialogVisible} onHide={hideDeleteDialog}>
            <ModalHeader closeButton>
                <Modal.Title>Delete Volumes</Modal.Title>
            </ModalHeader>
            <ModalBody>
                Do you really want to delete the selected volumes?
            </ModalBody>
            <ModalFooter>
                <Button onClick={hideDeleteDialog}>Cancel</Button>
                <Button className={'btn-danger'} onClick={deleteVolumes}>Delete</Button>
            </ModalFooter>
        </Modal>
    </>
}

export const DockerVolumeListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Volumes'}>
            <DockerVolumeListView />
        </DockerPage>
    </Page>
}
