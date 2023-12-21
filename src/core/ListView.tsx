import { Checkbox } from '.';
import { uniqueId } from './utils';
import React, {
    ReactNode,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';

type ListViewField = {
    [key: string]: (value: any) => ReactNode | string | null;
};

type ListViewProps = {
    items?: Array<any>;
    headers?: Array<string>;
    fields: ListViewField;
    checkable?: boolean;
    onSelectionChange?: (items: Array<any>) => any;
};

export const ListView = forwardRef((props: ListViewProps, ref) => {
    if (!props.items) return null;
    const [items, setItems] = useState(
        props.items.map((item) => {
            return {
                data: item,
                __key__: uniqueId(),
                __selected__: false,
            };
        }),
    );

    useImperativeHandle(ref, () => {
        return {
            unSelect: () => {
                const myItems = props.items.map((item) => {
                    return {
                        data: item,
                        __key__: uniqueId(),
                        __selected__: false,
                    };
                });
                props.onSelectionChange([]);
                setItems(myItems);
            },
        };
    });

    const allChecked =
        items?.filter((item) => item.__selected__).length === items?.length;

    return (
        <table className={'table data-table table-bordered small fs-6'}>
            {props.headers?.length > 0 && (
                <thead>
                    <tr>
                        {props.checkable && (
                            <th className={'icon-cell'}>
                                <Checkbox
                                    type={'checkbox'}
                                    checked={allChecked}
                                    onChange={(e: any) => {
                                        const checked = e.target.checked;
                                        const newItems = items.map(
                                            (filtered) => {
                                                filtered.__selected__ = checked;
                                                return filtered;
                                            },
                                        );
                                        setItems(newItems);
                                        if (props.onSelectionChange) {
                                            props.onSelectionChange(
                                                newItems
                                                    .filter(
                                                        (el) => el.__selected__,
                                                    )
                                                    .map((el) => el.data),
                                            );
                                        }
                                    }}
                                />
                            </th>
                        )}
                        {props.headers.map((header) => {
                            return <th key={uniqueId()}>{header}</th>;
                        })}
                    </tr>
                </thead>
            )}
            <tbody>
                {items.map((item) => {
                    return (
                        <tr key={uniqueId()}>
                            {props.checkable && (
                                <td className={'icon-cell'}>
                                    <Checkbox
                                        type={'checkbox'}
                                        checked={item.__selected__}
                                        onChange={(e: any) => {
                                            const checked = e.target.checked;
                                            const newItems = items.map(
                                                (filtered) => {
                                                    if (
                                                        filtered.__key__ ===
                                                        item.__key__
                                                    ) {
                                                        filtered.__selected__ =
                                                            checked;
                                                    }
                                                    return filtered;
                                                },
                                            );
                                            setItems(newItems);
                                            if (props.onSelectionChange) {
                                                props.onSelectionChange(
                                                    newItems
                                                        .filter(
                                                            (el) =>
                                                                el.__selected__,
                                                        )
                                                        .map((el) => el.data),
                                                );
                                            }
                                        }}
                                    />
                                </td>
                            )}
                            {Object.keys(props.fields).map((fieldKey) => {
                                return (
                                    <td key={uniqueId()}>
                                        {props.fields[fieldKey](item.data)}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
});
