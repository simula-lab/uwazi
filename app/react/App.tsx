import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Provider } from 'react-redux';
import { getRoutes } from './Routes';
import CustomProvider from './App/Provider';
import { store } from './store';

const reduxState = store?.getState();

const router = createBrowserRouter(
  getRoutes(reduxState?.settings.collection.toJS(), reduxState?.user.get('_id'))
);

const App = () => (
  <Provider store={store as any}>
    <CustomProvider>
      <RecoilRoot>
        <RouterProvider router={router} fallbackElement={null} />
      </RecoilRoot>
    </CustomProvider>
  </Provider>
);

export { App };
