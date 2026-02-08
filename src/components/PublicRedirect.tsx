import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/redirect");
    } else {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
    </div>
  );
};

export default PublicRedirect;
