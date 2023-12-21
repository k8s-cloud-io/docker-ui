import React, { PropsWithChildren } from 'react';

export const Toolbar = (props: PropsWithChildren) => {
    return <div className={'toolbar'}>{props.children}</div>;
};
