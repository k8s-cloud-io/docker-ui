import React from 'react';
import {Alert, Button, Modal} from "react-bootstrap";

type ErrorDialogProps = {
    message: string;
    visible: boolean;
    onHide?: () => void | {}
};

export const ErrorDialog = (props: ErrorDialogProps) => {
    return (
        <Modal
            backdrop={'static'}
            show={props.visible}
            onHide={props.onHide}
        >
            <Modal.Header>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant={'danger'}>{props.message}</Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button className={'btn-primary'} onClick={props.onHide}>OK</Button>
            </Modal.Footer>
        </Modal>
    );
};
