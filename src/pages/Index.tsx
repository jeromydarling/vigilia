import { MainLayout } from '@/components/layout/MainLayout';

const Index = () => {
  return (
    <MainLayout title="Vigilia" subtitle="A liturgy of attention">
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Vigilia</h1>
          <p className="text-muted-foreground">
            Your dashboard is being prepared. Visit your residents, record what mattered, and let no story go unheard.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
