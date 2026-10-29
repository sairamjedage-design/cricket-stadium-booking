import { Spinner } from 'react-spinners';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Loading...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner
        color="#3b82f6"
        size={40}
        aria-label="Loading"
      />
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingSpinner;