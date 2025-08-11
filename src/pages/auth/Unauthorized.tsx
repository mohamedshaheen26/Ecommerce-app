import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-sm p-8 text-center space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900'>Unauthorized</h1>
          <p className='text-gray-600'>
            You don't have permission to view this page.
          </p>
        </div>

        <div className='flex gap-3 justify-center'>
          <Button variant='secondary' onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
