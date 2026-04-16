import { useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState('');
  const [currentState, setCurrentState] = useState('Login');
  const [trigger, setTrigger] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/resume/get-resumes', { headers: { token } })
      if (response.data.success) {
        if (response.data.resumes.length === 0) {
          toast.info("No resumes found. Create your first resume!");
        }
        setResumeData(response.data.resumes);
      }
    } catch (error) {
      toast.error("Error fetching resumes:" + error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResumes();
    }
  }, [token]);

  const value = {
    backendUrl,
    token,
    setToken,
    navigate,
    currentState,
    setCurrentState,
    trigger,
    setTrigger,
    resumeData,
    fetchResumes
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;