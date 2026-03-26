import { EmptyState } from '../components/ui/EmptyState';
import { PageWrapper } from '../components/layout/PageWrapper';

export const NotFoundPage = () => {
  return (
    <PageWrapper>
      <div className="py-12">
        <EmptyState
          title="Page not found"
          description="The page you are looking for does not exist."
          actionLabel="Back to Home"
          actionTo="/home"
        />
      </div>
    </PageWrapper>
  );
};
