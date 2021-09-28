import React from 'react';
import { mount } from '@cypress/react';
import App from '../../src/App';

it('renders dashboard', () => {
  mount(<App/>);
  cy.get('a').reload();
});