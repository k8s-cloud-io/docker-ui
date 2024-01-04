import React from 'react';
import {Modal} from "react-bootstrap";

type BlockingDialogProps = {
    title: string;
    message: string;
    visible: boolean;
    onHide?: () => void;
    id: string;
};

export const BlockingDialog = (props: BlockingDialogProps) => {
    return (
        <Modal
            backdrop={'static'}
            show={props.visible}
            onHide={props.onHide}
        >
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.message}</Modal.Body>
        </Modal>
    );
};
