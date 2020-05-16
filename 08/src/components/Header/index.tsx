import React from 'react';

import { Link, useRouteMatch } from 'react-router-dom';

import { Container } from './styles';

import Logo from '../../assets/logo.svg';

interface HeaderProps {
  size?: 'small' | 'large';
}

const Header: React.FC<HeaderProps> = ({ size = 'large' }: HeaderProps) => {
  const { path } = useRouteMatch();

  return (
    <Container size={size} path={path}>
      <header>
        <img src={Logo} alt="GoFinances" />
        <nav>
          <Link to="/" className="dashboard">
            Listagem
          </Link>
          <Link to="import">Importar</Link>
        </nav>
      </header>
    </Container>
  );
};

export default Header;