import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ShopContext } from "../Context/ShopContext";
import { Link } from "react-router-dom";

export default function Navbar() {
    const { token,setToken,setCurrentState,setTrigger,navigate } = useContext(ShopContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
    setIsLoggedIn(token ? true : false);
    
}, [token]);
    return (
        <nav className="w-full bg-white border-b border-black px-6 py-4">
            <div className="flex items-center justify-between md:mx-10">
                {/* Logo */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-25 rounded flex items-center justify-center">
                            <img src={assets.logo} alt="logo" className="w-full" />
                        </div>
                    </Link>

                    {/* Dashboard link — navigates to / */}
                    {token && <Link to='/' className=" hidden sm:inline-flex px-3 py-1.5 text-lg hover:font-semibold"> Dashboard</Link>}
                    {/* Create CV link — navigates to /create-resume */}
                    {token && <Link to='/create-resume' className=" hidden sm:inline-flex px-3 py-1.5 text-lg hover:font-semibold"> Create Resume</Link>}
                    
                </div>

                {/* Desktop links */}
                <div className="hidden sm:flex items-center gap-3">

                    {isLoggedIn ? (
                        <>
                            <button onClick={() => {setToken(null); navigate('/login')}}
                                className="text-sm text-white bg-black px-4 py-1.5 rounded hover:bg-gray-800 transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to='/login' >
                                <button onClick={()=>{setCurrentState('Login'); setTrigger(false)}} className="text-sm text-black border border-black px-4 py-1.5 rounded hover:bg-black hover:text-white transition-colors">
                                    Login
                                </button>
                                <button onClick={()=>{setCurrentState('Sign Up'); setTrigger(true)}} className="text-sm text-white bg-black ml-3 px-4 py-1.5 rounded hover:bg-gray-800 transition-colors">
                                    Sign up
                                </button>
                            </Link> 
                        </>
                    )}
                </div>

                {/* Hamburger (mobile) */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                    className="sm:hidden flex flex-col gap-1 p-1">
                    <span className={`block w-5 h-0.5 bg-black transition-all
            ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                    <span className={`block w-5 h-0.5 bg-black transition-all
            ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-5 h-0.5 bg-black transition-all
            ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="sm:hidden w-4/6 m-auto mt-4 border-t border-black pt-4 flex flex-col gap-2">

                    {/* Create CV link — navigates to /create-resume */}
                    <a href="/create-resume"
                        className="h-8 sm:inline-flex items-center text-sm
                        text-black border border-black px-4 py-1 rounded
                        hover:bg-black hover:text-white transition-colors">
                        Create CV
                    </a>

                    {isLoggedIn ? (
                        <>
                            <button onClick={() => setIsLoggedIn(false)}
                                className="text-sm text-white bg-black px-4 py-2 rounded
                         hover:bg-gray-800 transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsLoggedIn(true)}
                                className="text-sm text-black border border-black
                           px-4 py-2 rounded
                           hover:bg-black hover:text-white transition-colors">
                                Login
                            </button>
                            <button onClick={() => setIsLoggedIn(true)}
                                className="text-sm text-white bg-black px-4 py-2 rounded
                           hover:bg-gray-800 transition-colors">
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}