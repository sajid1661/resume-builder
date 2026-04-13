import { useContext, useEffect, useState } from "react";
import axios from 'axios'
import { ShopContext } from "../Context/ShopContext";

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { backendUrl, navigate, token, setToken, setCurrentState,currentState,trigger,setTrigger } = useContext(ShopContext);

    const stateHandler = () => {

        setTrigger((prev) => {
            const newValue = !prev;
            setCurrentState(newValue ? 'Sign Up' : 'Login');
            return newValue;
        });
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (currentState == 'Login') {
                const response = await axios.post(backendUrl + '/api/user/login', { email, password })
                if (response.data.success) {
                    setToken(response.data.token);
                    alert(response.data.message);
                } else {
                    alert(response.data.message);
                }
            } else {
                const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
                if (response.data.success) {
                    setToken(response.data.token);
                    alert(response.data.message);
                } else {
                    alert(response.data.message);
                }
            }
        } catch (error) {
            alert(error.message);
        }
    }

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token]);



    return (
        <div className="" >
            <form onSubmit={onSubmitHandler} className="max-[400px]:w-5/6 w-4/6 m-auto flex flex-col items-center gap-5 mt-20">
                <div className="flex justify-center items-center gap-2 prata-regular ">
                    <h1 className="text-4xl">{currentState}</h1>
                    <hr className="border-none w-10 h-[1.5px] bg-gray-800 " />
                </div>
                <div className="w-full flex flex-col ">
                    {currentState == 'Sign Up' && (<input type='text' onChange={(e) => setName(e.target.value)} name='name' placeholder="Name" required className="w-full sm:w-100 m-auto mb-4 px-3 py-1.5 border" />)}
                    <input type="text" onChange={(e) => setEmail(e.target.value)} name="email" id="" placeholder="Email" required className="w-full sm:w-100 m-auto px-3 py-1.5 mb-4 border" />
                    <input type="password" onChange={(e) => setPassword(e.target.value)} name="password" placeholder="Password" required className=" w-full sm:w-100 m-auto px-3 py-1.5 border " />
                </div>
                <div className="w-full sm:w-100 flex justify-between">
                    <p className="cursor-pointer">Farget Password</p>
                    <p onClick={stateHandler} className="cursor-pointer">{trigger == true ? 'Login Here' : 'Create Account'}</p>
                </div>
                <div>
                    <button type="submit" className="bg-black/75 hover:bg-black/90 text-white w-30 px-3 py-1.5 rounded-lg cursor-pointer text-lg">{currentState == 'Login' ? 'Login' : 'Sign Up'}</button>
                </div>
            </form>
        </div>
    )
}

export default Login;