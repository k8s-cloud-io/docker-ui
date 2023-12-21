import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, Alert, Button, ListView} from "@core";
import {DockerPage} from "./DockerPage";
import React, {useState} from "react";
import {IMAGE_LIST} from "@projections/docker-query";
import {IMAGE_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {ImageListDetails} from "./partials/ImageListDetails";

const DockerImageListView = () => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(null);
    const state = useQuery({
        query: IMAGE_LIST
    })

    const prune = () => {
        state.client.mutate({
            mutation: IMAGE_PRUNE
        }).then(() => {
            setSelectedItems([]);
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
        </Toolbar>
        <ListView
            onSelectionChange={(items) => setSelectedItems(items)}
            headers={[
                'name', 'version', 'created at'
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
                created: (value: any) => {
                    return dayjs(value.created * 1000).format("YYYY-MM-DD HH:mm:ss")
                }
            }}
            checkable
            items={state.data['images']}
        />
        {
            detailsVisible &&
            <ImageListDetails
                id={selectedImage?.id}
                name={selectedImage?.name}
                version={selectedImage?.version}
                visible={true}
                onHide={() => {
                    setSelectedImage(null);
                    setDetailsVisible(false)
                }}
            />
        }
    </>
}

export const DockerImageListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Images'}>
            <DockerImageListView />
        </DockerPage>
    </Page>
}
