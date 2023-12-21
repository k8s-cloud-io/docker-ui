import { Modal } from '.';
import React from 'react';

type BlockingDialogProps = {
    title: string;
    message: string;
    visible: boolean;
    onHide?: () => void;
};

export const BlockingDialog = (props: BlockingDialogProps) => {
    return (
        <Modal backdrop={'static'} show={props.visible} onHide={props.onHide}>
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>{props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{props.message}</Modal.Body>
            </Modal.Dialog>
        </Modal>
    );
};
