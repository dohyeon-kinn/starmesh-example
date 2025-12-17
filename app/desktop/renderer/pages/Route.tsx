import { HashRouter, Navigate, Routes as ReactRoutes, Route } from 'react-router';

import { PATH } from '@/renderer/constants/path';
import { Index } from './index/index';

export function Routes() {
  return (
    <HashRouter>
      <ReactRoutes>
        <Route path={PATH.INDEX} element={<Index />} />
        <Route path="*" element={<Navigate to={PATH.INDEX} replace />} />
      </ReactRoutes>
    </HashRouter>
  );
}
