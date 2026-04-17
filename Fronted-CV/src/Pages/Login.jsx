import { useContext, useState } from "react";
import axios from 'axios'
import { ShopContext } from "../Context/ShopContext";
import { toast } from "react-toastify";

const errorClass = 'text-xs text-red-500 text-left w-full sm:w-100 m-auto ';
const invalidBorder = '!border-red-400';

const FieldError = ({ field, errors, touched }) =>
  errors[field] && touched[field] ? (
    <p className={errorClass}>{errors[field]}</p>
  ) : null;

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { backendUrl, navigate, setToken, setCurrentState,currentState,trigger,setTrigger } = useContext(ShopContext);
    const [loading, setLoading] = useState(false);
    // validation state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validators = {
        email: (v) => {
            const s = (v || '').trim();
            return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(s)
              ? ''
              : 'Email must be a Gmail address (example@gmail.com).';
        },
        password: (v) => (v && v.length >= 8 ? '' : 'Password must be at least 8 characters.'),
    };

    const validateField = (field, value) => {
        if (!validators[field]) return;
        const msg = validators[field](value);
        setErrors(prev => ({ ...prev, [field]: msg }));
    };

    const validateAll = () => {
        const next = {
            email: validators.email(email),
            password: validators.password(password),
        };
        setErrors(next);
        setTouched({ email: true, password: true });
        return Object.values(next).every(e => e === '');
    };

    const stateHandler = () => {

        setTrigger((prev) => {
            const newValue = !prev;
            setCurrentState(newValue ? 'Sign Up' : 'Login');
            return newValue;
        });
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateAll()) {
            toast.error('Please fix validation errors before submitting.');
            return;
        }

        if(loading) return; // Prevent multiple submissions

        setLoading(true);

        try {
            if (currentState == 'Login') {
                const response = await axios.post(backendUrl + '/api/user/login', { email, password })
                if (response.data.success) {
                    setToken(response.data.token);
                    localStorage.setItem('token', response.data.token);
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                    setLoading(false);
                    return navigate('/login');
                }
            } else {
                const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
                if (response.data.success) {
                    setToken(response.data.token);
                    localStorage.setItem('token', response.data.token);
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                    setLoading(false);
                    return navigate('/login');
                }
            }
        } catch (error) {
            toast.error(error.message);
                setLoading(false);
            return navigate('/login');
        }
        navigate('/');
    }


    return (
        <div className="" >
            <form onSubmit={onSubmitHandler} className="max-[400px]:w-5/6 w-4/6 m-auto flex flex-col items-center gap-5 mt-20">
                <div className="flex justify-center items-center gap-2 prata-regular ">
                    <h1 className="text-4xl">{currentState}</h1>
                    <hr className="border-none w-10 h-[1.5px] bg-gray-800 " />
                </div>
                <div className="w-full flex flex-col gap-3 ">
                    {currentState == 'Sign Up' && (
                      <input type='text' onChange={(e) => setName(e.target.value)} name='name' placeholder="Name" required className="w-full sm:w-100 m-auto mb-4 px-3 py-1.5 border" />
                    )}

                    <div className='mb-4'>
                      <input type="email"
                        onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
                        onBlur={() => { setTouched(prev => ({ ...prev, email: true })); validateField('email', email); }}
                        name="email" id="" placeholder="Email" required
                        className={`w-full sm:w-100 m-auto px-3 py-1.5 border ${touched.email && errors.email ? invalidBorder : ''}`}
                      />
                       <FieldError field="email" errors={errors} touched={touched} />
                    </div>

                    <div>
                      <input type="password"
                        onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
                        onBlur={() => { setTouched(prev => ({ ...prev, password: true })); validateField('password', password); }}
                        name="password" placeholder="Password" required
                        className={` w-full sm:w-100 m-auto px-3 py-1.5 border ${touched.password && errors.password ? invalidBorder : ''}`}
                      />
                       <FieldError field="password" errors={errors} touched={touched} />
                    </div>
                </div>
                <div className="w-full sm:w-100 flex justify-between">
                    <p className="cursor-pointer">Farget Password</p>
                    <p onClick={stateHandler} className="cursor-pointer">{trigger == true ? 'Login Here' : 'Create Account'}</p>
                </div>
                <div>
                    <button type="submit"  className="bg-black/75 hover:bg-black/90 text-white w-30 px-3 py-1.5 rounded-lg cursor-pointer text-lg">{currentState == 'Login' ? 'Login' : 'Sign Up'}</button>
                </div>
            </form>
        </div>
    )
}

export default Login;