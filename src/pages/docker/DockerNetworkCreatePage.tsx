import React, {useRef, RefObject, useState, forwardRef, useEffect} from "react";
import {DockerPage} from "./DockerPage";
import {Page, Button, Checkbox, TextInput} from "@core";
import {useNavigate} from "@k8s-cloud-io/react-router";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {NETWORK_CREATE} from "@projections/docker-mutation";
import {Alert, Collapse, Form, Modal} from "react-bootstrap";
import {LabelObject} from "./props";
import {LabelCreator} from "./partials/LabelCreator";

const isIPAddr = (ipaddress: string) => {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress);
}

const intToIp4 = (int: number) =>
    [(int >>> 24) & 0xFF, (int >>> 16) & 0xFF,
        (int >>> 8) & 0xFF, int & 0xFF].join('.');

const ip4ToInt = (ip: string) =>
    ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;

const calculateCidrRange = (cidr: string) => {
    const [range, bits = 32] = cidr.split('/');
    const b: number = bits as number;
    const mask = ~(2 ** (32 - b) - 1);
    return [intToIp4(ip4ToInt(range) & mask), intToIp4(ip4ToInt(range) | ~mask)];
};

const SubnetConfig = forwardRef((props:{error?: string}, ref: any) => {
    const inputRef: RefObject<HTMLInputElement> = useRef();
    const selectRef: RefObject<HTMLSelectElement> = useRef();

    const [config, setConfig] = useState({
        ipAddress: null,
        suffix: 24
    })

    useEffect(() => {
        ref.current = config
    }, [config])

    const onConfigChange = (event: any) => {
        const nodeType = event.currentTarget.nodeName.toLowerCase();

        let key = null;
        let value = null;
        if( nodeType === 'input' ) {
            key = 'ipAddress';
            value = inputRef.current.value;
        }
        if( nodeType === 'select' ) {
            key = 'suffix';
            value = selectRef.current.value;
        }

        config[key] = value;
        setConfig({...config})
    }

    return <div className={'row flex flex-row align-items-center mt-3 mb-3 subnet-item'}>
        <label className={'col-1 form-label m-0'}>CIDR</label>
        <div className={'col-3 flex flex-column'}>
            <div className={'flex flex-row align-items-center'}>
                <input onChange={onConfigChange} type={'text'} ref={inputRef} className={'form-control form-control-sm me-3'} placeholder={'enter address'}/>
                <span className={'fs-4 pe-3'}>/</span>
                <select onChange={onConfigChange} ref={selectRef} className={'w-20 pe-1'} defaultValue={24}>
                    {
                        new Array(30).fill(null).map((_,i) => <option value={i}>{i}</option> )
                    }
                </select>
            </div>
            {
                props.error &&
                <small className={'text-danger fw-400'}>{props.error}</small>
            }
        </div>
    </div>
});

export const DockerNetworkCreatePage = () => {
    const navigate = useNavigate();
    const graphqlClient = useGraphQLClient();
    const nameRef: RefObject<HTMLInputElement> = useRef();
    const driverRef: RefObject<HTMLSelectElement> = useRef();
    const internalRef: RefObject<HTMLInputElement> = useRef();
    const ingressRef: RefObject<HTMLInputElement> = useRef();
    const configRef = useRef<{
        ipAddress: string,
        suffix: number
    }>();
    const [labels, setLabels] = useState<LabelObject>(null);

    const [subnetType, setSubnetType] = useState('auto');
    const [createdNetwork, setCreatedNetwork] = useState(null);
    const [createError, setCreateError] = useState(null);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const goBack = () => {
        navigate('/docker/networks')
    }
    const onNameChange = (e: any) => {
        nameRef.current.value = e.currentTarget.value;
    }

    const onSubnetTypeChange = (e) => {
        setSubnetType( e.currentTarget.value )
    }

    const createNetwork = () => {
        setCreateError(null);
        const name = nameRef.current.value;
        const driver = driverRef.current.value;
        const internal = internalRef.current.checked;
        const ingress = ingressRef.current.checked;
        const subnetConfig = configRef.current;
        let cidr = null;

        if( !name?.trim().length) {
            const error = {
                'name': 'Invalid network name'
            }
            setCreateError(error);
            return;
        }

        if( subnetType === 'manual' ) {
            if( !subnetConfig.ipAddress?.length ) {
                const error = {
                    'subnet': 'Invalid subnet address'
                }
                setCreateError(error);
                return;
            }

            if( !isIPAddr(subnetConfig.ipAddress)) {
                const error = {
                    'subnet': 'Invalid subnet address'
                }
                setCreateError(error);
                return;
            }

            cidr = subnetConfig.ipAddress.concat(`/${subnetConfig.suffix}`);
            if( !calculateCidrRange(cidr)) {
                const error = {
                    'subnet': 'Invalid subnet address'
                }
                setCreateError(error);
                return;
            }
        }

        const config = {
            labels,
            name,
            driver,
            internal,
            ingress,
            subnet: cidr
        }

        graphqlClient.mutate({
            mutation: NETWORK_CREATE,
            variables: {
                config
            }
        })
        .then(() => {
            setCreatedNetwork(name);
        })
        .catch(e => {
            setCreateError({
                'global': e.message
            });
        })
    }

    const onLabelChange = (labels: LabelObject) => {
        setLabels(labels);
    }

    return <Page>
        <DockerPage pageTitle={'Create Network'} backLink={'/docker/networks'}>
            {
                createdNetwork &&
                <div className={'col-6'}>
                    <Alert variant={'success'} className={'mb-3'} onClose={goBack} dismissible>
                        <Alert.Heading className={'h6'}>
                            Network created
                        </Alert.Heading>
                        <p>Network '{createdNetwork}' created successfully.</p>
                    </Alert>
                </div>
            }
            {
                !createdNetwork &&
                <div className={'flex flex-column'}>
                    {
                        createError && createError['global'] &&
                        <Alert variant={'danger'} className={'p-2'}>
                            {createError['global']}
                        </Alert>
                    }
                    <h6>General</h6>
                    <div className={'row flex flex-row align-items-center mb-3'}>
                        <label className={'col-1 form-label m-0'}>Name</label>
                        <div className={'col-3'}>
                            <TextInput ref={nameRef} onChange={onNameChange}/>
                            {
                                createError && createError['name'] &&
                                <small className={'text-danger fw-400'}>{createError['name']}</small>
                            }
                        </div>
                    </div>
                    <div className={'row flex flex-row align-items-center mb-3'}>
                        <label className={'col-1 form-label m-0'}>Driver</label>
                        <div className={'col-3'}>
                            <select ref={driverRef} defaultValue={'bridge'}>
                                <option value={'bridge'}>bridge</option>
                                <option value={'host'}>host</option>
                                <option value={'overlay'}>overlay</option>
                                <option value={'ipvlan'}>ipvlan</option>
                                <option value={'macvlan'}>macvlan</option>
                                <option value={'none'}>none</option>
                            </select>
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <div className={'col-1'}></div>
                        <div className={'col-3'} style={{height: 'auto', width: '400'}}>
                            <div className={'border rounded-1'}>
                                <Button
                                    className={'collapse-toggle'}
                                    onClick={() => {
                                        setShowOptions(!showOptions)
                                    }}>Options</Button>
                                <Collapse in={showOptions}>
                                    <div className={'container p-2 border-top'}>
                                        <div className={'row row-cols-3 flex flex-row align-items-center mb-2'}>
                                            <label className={'col form-label m-0'}>Internal Access Only</label>
                                            <div className={'col'}>
                                                <Form.Check ref={internalRef} type={'switch'}/>
                                            </div>
                                        </div>
                                        <div className={'row row-cols-3 flex flex-row align-items-center'}>
                                            <label className={'col form-label m-0'}>Ingress Network</label>
                                            <div className={'col'}>
                                                <Form.Check ref={ingressRef} type={'switch'}/>
                                            </div>
                                        </div>
                                    </div>
                                </Collapse>
                            </div>
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <label className={'col-1 form-label'}>Labels</label>
                        <div className={'col-3'}>
                            <LabelCreator onChange={onLabelChange} />
                        </div>
                    </div>
                    <h6>Subnet Configuration</h6>
                    <div className={'row'}>
                        <label className={'col-1 form-label'}>Subnet Type</label>
                        <div className={'col-3 flex flex-column'}>
                            <Checkbox className={'mb-2'} onChange={onSubnetTypeChange} type={'radio'} label={'Automatic'} name={'creation-type'} value={'auto'} defaultChecked={true}/>
                            <Checkbox onChange={onSubnetTypeChange} type={'radio'} label={'Manual'} name={'creation-type'} value={'manual'}/>
                        </div>
                    </div>
                    {
                        subnetType === 'manual' &&
                        <SubnetConfig error={createError ? createError['subnet'] : null} ref={configRef} />
                    }
                    <div className={'flex flex-row align-items-center justify-content-end pe-3 col-4 mt-4'}>
                        <Button className={'btn-sm me-3'} onClick={() => {
                            navigate('/docker/networks');
                        }}>
                            Cancel
                        </Button>
                        <Button className={'btn-sm btn-primary'} onClick={createNetwork}>
                            Create Network
                        </Button>
                    </div>
                </div>
            }
        </DockerPage>
    </Page>
}