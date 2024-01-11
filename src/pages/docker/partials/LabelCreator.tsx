import React, {RefObject, useRef, useState} from "react";
import {Button} from "@core";
import {LabelObject} from "../props";
import {Alert, Modal} from "react-bootstrap";
import {TextInput} from "@k8s-cloud-io/react-bootstrap";

export const LabelCreator = (props: {onChange: (labels: LabelObject) => void}) => {
    const labelKeyRef: RefObject<HTMLInputElement> = useRef();
    const labelValRef: RefObject<HTMLInputElement> = useRef();
    const [labels, setLabels] = useState<LabelObject>(null);
    const [labelError, setLabelError] = useState(null);
    const [labelDialogVisible, setLabelDialogVisible] = useState(false);

    const onLabelKeyChange = (e: any) => {
        labelKeyRef.current.value = e.currentTarget.value;
    }

    const onLabelValueChange = (e: any) => {
        labelValRef.current.value = e.currentTarget.value;
    }

    const showLabelDialog = () => {
        setLabelError(null);
        setLabelDialogVisible(true)
    }

    const hideLabelDialog = () => {
        setLabelDialogVisible(false)
    }

    const addLabel = () => {
        setLabelError(null);
        const key = labelKeyRef.current.value?.trim();
        const value = labelValRef.current.value?.trim();

        const isValidKey = key && key.match(/^[a-z][?a-z0-9\/\_\-\.]+[a-z]$/i)?.length
        if( !isValidKey ) {
            setLabelError('Invalid label key');
            return;
        }

        const isValidVal = value !== undefined && value !== null;
        if( !isValidVal ) {
            setLabelError('Invalid label value');
            return;
        }

        const newLabels = {...labels}
        newLabels[key] = value;
        setLabels(newLabels);
        hideLabelDialog();
        props.onChange(newLabels);
    }

    const deleteLabel = (key: string) => {
        const newLabels = {};
        Object.keys(labels).forEach(labelKey => {
            if( key !== labelKey ) {
                newLabels[labelKey] = labels[labelKey];
            }
        })
        setLabels(newLabels);
        props.onChange(newLabels);
    }

    return <div>
        <Modal show={labelDialogVisible} onHide={hideLabelDialog}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Add Label
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={'container'}>
                    {
                        labelError &&
                        <div className={'row'}>
                            <Alert className={'p-2'} variant={'danger'}>
                                {labelError}
                            </Alert>
                        </div>
                    }
                    <div className={'row mb-3'}>
                        <label className={'form-label'}>Label Key</label>
                        <TextInput ref={labelKeyRef} onChange={onLabelKeyChange} />
                    </div>
                    <div className={'row mb-3'}>
                        <label className={'form-label'}>Label Value</label>
                        <TextInput ref={labelValRef} onChange={onLabelValueChange} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={hideLabelDialog}>Cancel</Button>
                <Button className={'btn-primary'} onClick={addLabel}>Add Label</Button>
            </Modal.Footer>
        </Modal>
        {
            Object.keys(labels||{}).length > 0 &&
            <table className={'table data-table table-bordered fs-6 small'}>
                {
                    Object.keys(labels).map( labelKey => {
                        return <tr>
                            <td className={'bg-light border-1 ps-2 pe-2'}>{labelKey}</td>
                            <td className={'border-1 ps-2 pe-2'}>{labels[labelKey]}</td>
                            <td className={'icon-cell border-1'}>
                                                    <span onClick={() => {
                                                        deleteLabel(labelKey)
                                                    }} className={'material-icons-outlined fs-5 text-danger pt-0 pb-0 cursor-pointer'}>delete</span>
                            </td>
                        </tr>
                    })
                }
            </table>
        }
        {
            Object.keys(labels||{}).length === 0 &&
            <p>
                <i>There are no labels configured</i>
            </p>
        }
        <Button className={'btn-secondary fs-6'} onClick={showLabelDialog}>Add Label</Button>
    </div>
}