import { gql } from '@k8s-cloud-io/react-graphql';

export const VOLUME_PRUNE = gql`
    mutation cleanVolumes {
        cleanVolumes
    }
`;

export const NETWORK_PRUNE = gql`
    mutation cleanNetworks {
        cleanNetworks
    }
`;

export const NETWORK_CREATE = gql`
    mutation createNetwork($name: String!, $driver: String!) {
        createNetwork(name: $name, driver: $driver)
    }
`;

export const NETWORK_DELETE = gql`
    mutation removeNetworks($networks: [String!]!) {
        removeNetworks(networks: $networks)
    }
`;

export const IMAGE_PRUNE = gql`
    mutation cleanImages {
        cleanImages
    }
`;

/*************************************************************************************************/

export const CONTAINER_START = gql`
    mutation startContainer($id: String!) {
        startContainer(id: $id)
    }
`;
export const CONTAINER_STOP = gql`
    mutation stopContainer($id: String!) {
        stopContainer(id: $id)
    }
`;
export const CONTAINER_RESTART = gql`
    mutation restartContainer($id: String!) {
        restartContainer(id: $id)
    }
`;

export const CONTAINER_DELETE = gql`
    mutation deleteContainer($id: String!) {
        deleteContainer(id: $id)
    }
`;

export const CONTAINER_PRUNE = gql`
    mutation cleanContainers {
        cleanContainers
    }
`;
