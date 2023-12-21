import { Alert, Button, Modal } from '.';
import React from 'react';

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
            <Modal.Dialog>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert type={props.type}>{props.message}</Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button className={'btn-primary'} data-bs-dismiss={'modal'}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal>
    );
};
