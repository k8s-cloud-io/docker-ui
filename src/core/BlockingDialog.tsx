import { Modal } from '.';
import React from 'react';

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
            id={props.id}
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
