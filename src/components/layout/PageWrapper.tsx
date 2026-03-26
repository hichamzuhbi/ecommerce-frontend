import type { PropsWithChildren } from 'react';

export const PageWrapper = ({ children }: PropsWithChildren) => {
  return <div className="app-shell">{children}</div>;
};
