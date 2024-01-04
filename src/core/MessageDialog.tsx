import React from 'react';
import {Alert, Button, Modal} from "react-bootstrap";

type MessageDialogProps = {
    message: string;
    visible: boolean;
    onHide: () => void;
    type: 'info' | 'warning' | 'success' | 'danger';
};

export const MessageDialog = (props: MessageDialogProps) => {
    let title = 'Information';
    switch (props.type) {
        case 'warning':
        case 'success':
            title = props.type
                .charAt(0)
                .toUpperCase()
                .concat(props.type.slice(1));
            break;
        case 'danger':
            title = 'Error';
            break;
    }
    return (
        <Modal show={props.visible} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant={props.type}>{props.message}</Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button className={'btn-primary'} data-bs-dismiss={'modal'}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
