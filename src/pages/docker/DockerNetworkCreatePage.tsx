import React, {useRef, RefObject, useState, forwardRef, useEffect} from "react";
import {DockerPage} from "./DockerPage";
import {Page, Checkbox, Button, TextInput} from "@core";
import {useNavigate} from "@k8s-cloud-io/react-router";
import {useGraphQLClient} from "@k8s-cloud-io/react-graphql";
import {NETWORK_CREATE} from "@projections/docker-mutation";
import {Alert, Form} from "react-bootstrap";

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

const SubnetConfig = forwardRef((props, ref: any) => {
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

    return <div className={'row flex flex-row align-items-center mb-3 subnet-item'}>
        <label className={'col-1 form-label m-0'}>CIDR</label>
        <div className={'col-3 flex flex-row align-items-center'}>
            <input onChange={onConfigChange} type={'text'} ref={inputRef} className={'form-control form-control-sm me-3'} placeholder={'enter address'}/>
            <span className={'fs-4 pe-3'}>/</span>
            <select onChange={onConfigChange} ref={selectRef} className={'w-20 pe-1'} defaultValue={24}>
                {
                    new Array(30).fill(null).map((_,i) => <option value={i}>{i}</option> )
                }
            </select>
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
    const [subnetType, setSubnetType] = useState('auto');
    const [createdNetwork, setCreatedNetwork] = useState(null);
    const [error, setError] = useState(null);
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
        setError(null);
        const name = nameRef.current.value;
        const driver = driverRef.current.value;
        const internal = internalRef.current.checked;
        const ingress = ingressRef.current.checked;
        const subnetConfig = configRef.current;
        let cidr = null;

        if( !name?.trim().length) {
            setError('Invalid network name');
            return;
        }

        if( subnetType === 'manual' ) {
            if( !subnetConfig.ipAddress?.length ) {
                setError('Invalid subnet address');
                return;
            }

            if( !isIPAddr(subnetConfig.ipAddress)) {
                setError('Invalid subnet address');
                return;
            }

            cidr = subnetConfig.ipAddress.concat(`/${subnetConfig.suffix}`);
            if( !calculateCidrRange(cidr)) {
                setError('Invalid subnet address');
                return;
            }
        }

        // TODO check if required variables are empty or invalid
        const config = {
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
        // TODO check for error
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
                        error &&
                        <Alert variant={'danger'} className={'p-2'}>
                            <Alert.Heading className={'h6'}>Error</Alert.Heading>
                            {error}
                        </Alert>
                    }
                    <h6>General</h6>
                    <div className={'row flex flex-row align-items-center mb-3'}>
                        <label className={'col-1 form-label m-0'}>Name</label>
                        <div className={'col-3'}>
                            <TextInput ref={nameRef} onChange={onNameChange}/>
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
                    <div className={'row flex flex-row align-items-center mb-3'}>
                        <label className={'col-1 form-label m-0'}>Internal Only</label>
                        <div className={'col-3'}>
                            <Form.Check ref={internalRef} type={'switch'}/>
                        </div>
                    </div>
                    <div className={'row flex flex-row align-items-center mb-3'}>
                        <label className={'col-1 form-label m-0'}>Ingress Network</label>
                        <div className={'col-3'}>
                            <Form.Check ref={ingressRef} type={'switch'}/>
                        </div>
                    </div>
                    <div className={'row'}>
                        <label className={'col-1 form-label'}>Subnet Type</label>
                        <div className={'col-3 flex flex-column'}>
                            <Checkbox onChange={onSubnetTypeChange} type={'radio'} label={'Automatic'} name={'creation-type'} value={'auto'} defaultChecked={true}/>
                            <Checkbox onChange={onSubnetTypeChange} type={'radio'} label={'Manual'} name={'creation-type'} value={'manual'}/>
                        </div>
                    </div>
                    {
                        subnetType === 'manual' &&
                        <div className={'mt-3'}>
                            <h6>Subnet Configuration</h6>
                            <SubnetConfig ref={configRef} />
                        </div>
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