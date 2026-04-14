import React, { useContext} from 'react'
import ResumeCard from '../Components/ResumeCard';
import { ShopContext } from '../Context/ShopContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { resumeData, token } = useContext(ShopContext);

  if(!token){
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Please log in to view your dashboard</h1>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Resumes</h1>
          <Link to="/create-resume">
            <button className="px-4 py-2 bg-black text-white rounded-md hover:cursor-pointer">Create New Resume</button>
          </Link>
      </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {
            resumeData?.length>0 ?
          resumeData.map((resume) => (
            <Link key={resume._id}  to={`/resume/${resume._id}`} className="">
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