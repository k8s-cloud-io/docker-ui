import React, {RefObject, useRef, useState} from "react";
import {DockerPage} from "./DockerPage";
import {Button, Page} from "@core";
import {TextInput} from "@k8s-cloud-io/react-bootstrap";
import {LabelCreator} from "./partials/LabelCreator";
import {LabelObject} from "./props";
import {useNavigate} from "@k8s-cloud-io/react-router";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {Alert} from "react-bootstrap";
import {VOLUME_CREATE} from "@projections/docker-mutation";

export const DockerVolumeCreatePage = () => {
    const [labels, setLabels] = useState<LabelObject>(null);
    const nameRef: RefObject<HTMLInputElement> = useRef();
    const [volumeCreated, setVolumeCreated] = useState(null)
    const [createError, setCreateError] = useState(null)
    const client = useGraphQLClient();
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/docker/volumes")
    }

    const onLabelChange = (labels: LabelObject) => {
        setLabels(labels);
    }

    const createVolume = () => {
        setCreateError(null);
        const name = nameRef.current.value;
        if( name?.length < 2 ) {
            setCreateError('Name must be at least 2 characters');
            return;
        }

        if( !name.match(/[a-z][?a-zA-Z0-9\-\_]/i)) {
            setCreateError('Name must be start with a letter and must match /[a-z][?a-zA-Z0-9\\-\\_]/i');
            return;
        }

        client.mutate({
            mutation: VOLUME_CREATE,
            variables: {
                name,
                labels
            }
        })
        .then(() => {
            setVolumeCreated(name);
        })
        .catch( e => {
            setCreateError((e.extensions && e.extensions['debugMessage']) || e.message);
        })
    }

    return <Page>
        <DockerPage pageTitle={'Create Volume'} backLink={'/docker/volumes'}>
            {
                volumeCreated &&
                <div className={'col-6'}>
                    <Alert variant={'success'} className={'mb-3'} onClose={goBack} dismissible>
                        <Alert.Heading className={'h6'}>
                            Volume created
                        </Alert.Heading>
                        <p>Volume '{volumeCreated}' created successfully.</p>
                    </Alert>
                </div>
            }
            {
                !volumeCreated &&
                <>
                    {
                        createError &&
                        <Alert variant={'danger'} className={'p-2'}>
                            {createError}
                        </Alert>
                    }
                    <h6>General</h6>
                    <div className={'row mb-3'}>
                        <label className={'form-label col-1'}>Name</label>
                        <div className={'col-3'}>
                            <TextInput ref={nameRef} onChange={(e) => {
                                nameRef.current.value = e.currentTarget.value;
                            }}/>
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <label className={'col-1 form-label'}>Labels</label>
                        <div className={'col-3'}>
                            <LabelCreator onChange={onLabelChange} />
                        </div>
                    </div>
                    <div className={'flex flex-row align-items-center justify-content-end pe-3 col-4 mt-4'}>
                        <Button className={'btn-sm me-3'} onClick={() => {
                            navigate('/docker/volumes');
                        }}>
                            Cancel
                        </Button>
                        <Button className={'btn-sm btn-primary'} onClick={createVolume}>
                            Create Volume
                        </Button>
                    </div>
                </>
            }
        </DockerPage>
    </Page>
}