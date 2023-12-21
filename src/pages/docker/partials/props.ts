export type ImageDetailsProps = {
    id: string,
    name: string,
    version: string,
    visible: boolean,
    onHide: () => void
}

export type ContainerListDetailsProps = {
    visible: boolean,
    onHide?: () => void
    data: any
}

export type LoadingProps = {
    loading: boolean,
    loaded: boolean,
    data: any,
    error: string
}