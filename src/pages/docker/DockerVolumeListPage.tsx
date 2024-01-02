import {useQuery} from "@k8s-cloud-io/react-graphql";
import {Page, Toolbar, ListView} from "@core";
import {DockerPage} from "./DockerPage";
import React, {useState} from "react";
import {VOLUME_LIST} from "@projections/docker-query";
import {VOLUME_PRUNE} from "@projections/docker-mutation";
import dayjs from "dayjs";
import {Alert, Button} from "@k8s-cloud-io/react-bootstrap";

const DockerVolumeListView = () => {
    const [selectedItems, setSelectedItems] = useState([]);
    const state = useQuery({
        query: VOLUME_LIST
    })

    const prune = () => {
        state.client.mutate({
            mutation: VOLUME_PRUNE
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
                'name', 'created at'
            ]}
            fields={{
                name: (value: any) => {
                    return value.name;
                },
                created: (value: any) => {
                    return dayjs(value['createdAt']).format("YYYY-MM-DD HH:mm:ss")
                }
            }}
            checkable
            items={state.data['volumes']}
        />
    </>
}

export const DockerVolumeListPage = () => {
    return <Page>
        <DockerPage pageTitle={'Volumes'}>
            <DockerVolumeListView />
        </DockerPage>
    </Page>
}
