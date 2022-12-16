import { Navbar } from '@components/Navbar';
import { Outlet } from 'react-router-dom';

type BasicLayoutProps = {
  children?: JSX.Element | JSX.Element[];
};

export const BasicLayout = ({ children }: BasicLayoutProps) => {
  return (
    <>
      <Navbar />
      {children ? children : <Outlet />}
    </>
  );
};
