import {
    AnyComponent,
    createElement,
    FunctionalComponent,
    RenderableProps,
    ComponentChild,
    ComponentChildren
} from 'preact'

export {
    Attributes,
    FunctionalComponent as SFC,
    AnyComponent as ComponentType,
    AnyComponent as JSXElementConstructor,
    Component as ComponentClass,
    ClassAttributes,
    PreactContext as Context,
    PreactProvider as Provider,
    VNode as ReactElement,
    createElement,
    Fragment,
    Ref,
    render,
    JSX,
    RenderableProps as ComponentPropsWithRef
} from 'preact'

export {
    createContext,
    forwardRef,
    memo,
    useMemo,
    useState,
    useContext,
    useEffect,
    useCallback,
    useImperativeHandle,
    PropsWithChildren
} from "preact/compat";

export type ReactNode = ComponentChild | ComponentChildren;

// export type JSXElementConstructor = AnyComponent;