import { HashRouter, Navigate, Routes as ReactRoutes, Route } from 'react-router';

import { Index } from './pages/index';

export function App() {
  return (
    <HashRouter>
      <ReactRoutes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </ReactRoutes>
    </HashRouter>
  );
}
