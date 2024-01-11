import { gql } from '@k8s-cloud-io/react-graphql';

export const CONTAINER_LIST = gql`
    query containers {
        containers {
            id
            names
            created
            image
            state
            ports {
                privatePort
                publicPort
                type
            }
            labels
            networkSettings
        }
    }
`;

export const IMAGE_LIST = gql`
    query images {
        images {
            id
            created
            repoTags
            size
            labels
        }
    }
`;

export const IMAGE_DETAILS = gql`
    query image($id: String!) {
        image(id: $id) {
            id
            repoTags
            comment
            created
            config
            size
            labels
        }
    }
`;

export const NETWORK_LIST = gql`
    query networks {
        networks {
            id
            labels
            name
            created
            scope
            driver
            iPAM
        }
    }
`;

export const VOLUME_LIST = gql`
    query volumes {
        volumes {
            name
            labels
            createdAt
        }
    }
`;

export const CONTAINER_DETAILS = gql`
    query container($id: String!) {
        container(id: $id) {
            id
            name
            created
            state {
                status
                startedAt
            }
            config {
                hostname
                env
                image
                labels
                networkDisabled
            }
            networkSettings {
                networks
                ports
            }
        }
    }
`;
