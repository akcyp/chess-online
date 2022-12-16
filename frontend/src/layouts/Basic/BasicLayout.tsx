import { Button } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

export const BasicLayout = () => {
  return (
    <>
      <div>
        <Button as={Link} to={'/'}>
          Return to main page
        </Button>
        <Button as={Link} to={'/game'}>
          Game page
        </Button>
      </div>
      <Outlet />
    </>
  );
};
