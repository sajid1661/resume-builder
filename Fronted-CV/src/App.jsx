import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import CreateResume from './Pages/CreateResume'
import ResumeDetail from './Pages/ResumeDetail'
import EditResume from './Pages/EditResume'
import {Routes,Route}from 'react-router-dom'
import Navbar from './Components/Navbar'


function App() {

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/create-resume' element={<CreateResume/>} />
        <Route path='/resume/:id' element={<ResumeDetail />} />
        <Route path='/edit-resume/:id' element={<EditResume />} />
      </Routes>
    </div>
  )
}

export default App
