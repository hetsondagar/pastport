import { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: ReactNode;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl app-name-bold text-gradient mb-4">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
};

export default PageTitle;


