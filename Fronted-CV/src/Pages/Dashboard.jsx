import React, { useContext, useEffect} from 'react'
import ResumeCard from '../Components/ResumeCard';
import { ShopContext } from '../Context/ShopContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';


const Dashboard = () => {
  const { resumeData, token} = useContext(ShopContext);
useEffect(() => {
  if (!token) {
    toast.error("Unauthorized access - please login.");
  }
}, [token]);

  if(!token){
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Please log in to view your dashboard</h1>
        <Link to="/login">
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-800 text-white rounded-md hover:cursor-pointer">Log In</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="m-auto w-fit sm:w-full p-8">
      <div className="flex items-center justify-between gap-10 mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold sm:font-bold">My Resumes</h1>
          <Link to="/create-resume">
            <button className=" text-xs sm:text-lg p-2  sm:px-4  bg-black text-white rounded-md hover:cursor-pointer">Create New Resume</button>
          </Link>
      </div>
          <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {
            resumeData?.length>0 ?
          resumeData.map((resume) => (
            <Link  key={resume._id}  to={`/resume/${resume._id}`} className="">
              <ResumeCard resume={resume} />
            </Link>
          )):(
            <div className="col-span-4 text-center">
              <p className="text-gray-500">No resumes found</p>
            </div>
          )}
        </div>
    </div>
  )
}

export default Dashboard;