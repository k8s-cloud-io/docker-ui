import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView, Button, BlockingDialog, ErrorDialog} from "@core";
import {DockerPage} from "./DockerPage";
import React, {createRef, RefObject, useEffect, useRef, useState} from "react";
import {IMAGE_LIST} from "@projections/docker-query";
import {IMAGE_DELETE, IMAGE_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {ImageListDetails} from "./partials/ImageListDetails";
import {bytesToSize} from "@core/utils";
import {Alert, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";

const DockerImageListView = () => {
    const listRef: RefObject<any> = createRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [blockingDialogVisible, setBlockingDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null)
    const state = useQuery({
        query: IMAGE_LIST
    })

    const prune = () => {
        state.client.mutate({
            mutation: IMAGE_PRUNE
        }).then(() => {
            listRef.current.unSelect();
            state.refresh();
        });
    }

    const hideDetails = () => {
        setSelectedImage(null);
        setDetailsVisible(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
    }

    const showDeleteDialog = () => {
        setDeleteDialogVisible(true);
    }

    const hideErrorDialog = () => {
        setErrorMessage(null)
    }

    useEffect(() => {
        if( selectedItems.length && !state.loaded ) {
            setSelectedItems([]);
        }
    }, [state.loaded]);
    const deleteImages = () => {
        setDeleteDialogVisible(false);
        setBlockingDialogVisible(true);
        state.client.mutate({
            mutation: IMAGE_DELETE,
            variables: {
                images: selectedItems.map( item => item.id)
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
                'name', 'version', 'size', 'created at'
            ]}
            fields={{
                name: (value: any) => {
                    const parts = value['repoTags']?.length ? value['repoTags'][0].split(":") : [];
                    if( !parts.length ) return '<unknown>';

                    let name = parts[0];
                    let version = parts[1];
                    return <span className={'link-primary'} onClick={() => {
                        setSelectedImage({
                            id: value.id,
                            name,
                            version
                        });
                        setDetailsVisible(true);
                    }}>{name}</span>;
                },
                version: (value: any) => {
                    const parts = value['repoTags']?.length ? value['repoTags'][0].split(":") : [];
                    return parts.length ? parts[1] : '<unknown>';
                },
                size: (value: any) => {
                    return bytesToSize(value['size']);
                },
                created: (value: any) => {
                    return dayjs(value.created * 1000).format("YYYY-MM-DD HH:mm:ss")
                }
            }}
            checkable
            items={state.data['images']}
        />
        <ImageListDetails
            id={selectedImage?.id}
            name={selectedImage?.name}
            version={selectedImage?.version}
            visible={detailsVisible}
            onHide={hideDetails}
        />
        <ErrorDialog message={errorMessage} visible={errorMessage !== null} onHide={hideErrorDialog}/>
        <BlockingDialog
            title={'Delete Images'}
            message={'Please wait, while selected images are deleted...'}
            visible={blockingDialogVisible}
            onHide={() => setBlockingDialogVisible(false)}
        />
        <Modal show={deleteDialogVisible} onHide={hideDeleteDialog}>
            <ModalHeader closeButton>
                <Modal.Title>Delete Images</Modal.Title>
            </ModalHeader>
            <ModalBody>
                Do you really want to delete the selected images?
            </ModalBody>
            <ModalFooter>
                <Button onClick={hideDeleteDialog}>Cancel</Button>
                <Button className={'btn-danger'} onClick={deleteImages}>Delete</Button>
            </ModalFooter>
        </Modal>
    </>
}

export const DockerImageListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Images'}>
            <DockerImageListView />
        </DockerPage>
    </Page>
}
