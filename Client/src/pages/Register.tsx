import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/users/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="username" placeholder="Username" required onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" name="email" placeholder="Email" required onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" name="password" placeholder="Password" required onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold transition">Register</button>
        </form>
        <p className="text-center mt-4 text-sm">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
};
export default Register;
