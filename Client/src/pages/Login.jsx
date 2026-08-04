import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import API from '../api';

const Login = () =>{
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await API.post('/users/login', formData);

            localStorage.setItem('token', response.data.token);
            navigate('/');
        } catch(err){
            setError(err.response?.data?.message || "Invalid credentials");
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" name="email" placeholder="Email" required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                    />
                    <input 
                        type="password" name="password" placeholder="Password" required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold transition">
                        Login
                    </button>
                </form>
                <p className="text-center mt-4 text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};
export default Login;