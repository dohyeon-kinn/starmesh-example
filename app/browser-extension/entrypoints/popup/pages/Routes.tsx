import { HashRouter, Navigate, Routes as ReactRoutes, Route } from 'react-router';

import { Index } from './index';
import { Login } from './login';

export function Routes() {
  return (
    <HashRouter>
      <ReactRoutes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </ReactRoutes>
    </HashRouter>
  );
}
