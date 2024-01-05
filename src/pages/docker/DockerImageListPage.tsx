import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView, Button} from "@core";
import {DockerPage} from "./DockerPage";
import React, {createRef, RefObject, useRef, useState} from "react";
import {IMAGE_LIST} from "@projections/docker-query";
import {IMAGE_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {ImageListDetails} from "./partials/ImageListDetails";
import {bytesToSize} from "@core/utils";
import {Alert} from "react-bootstrap";

const DockerImageListView = () => {
    const listRef: RefObject<any> = createRef();
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
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
            <Button disabled={selectedItems.length === 0}>
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
    </>
}

export const DockerImageListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Images'}>
            <DockerImageListView />
        </DockerPage>
    </Page>
}
