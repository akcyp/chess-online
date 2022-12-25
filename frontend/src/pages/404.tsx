import { Center } from '@chakra-ui/react';
import { BasicLayout } from 'src/layouts/BasicLayout';
import styled from 'styled-components';

const Fancy404Text = styled.div`
  text-align: center;
  font-size: 155px;
  animation: glitch 5s linear infinite;
`;

export const NotFoundPage = () => {
  return (
    <BasicLayout username="?">
      <Center h="80vh">
        <Fancy404Text>404</Fancy404Text>
      </Center>
    </BasicLayout>
  );
};
