import React, {useState, useRef, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import {authService} from '../api/authService';
import {useAuth} from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';

const VerifyOtpPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {login} = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputs = useRef([]);

    const {registrationData, mode: stateMode, email: stateEmail} = location.state || {};
    const targetEmail = stateEmail || registrationData?.email;
    const currentMode = stateMode;

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        if (val && index < 5) inputs.current[index + 1].focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputs.current[index - 1].focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (!targetEmail) {
            toast.error("Session expired. Please try logging in again.");
            return;
        }

        const toastId = toast.loading("Verifying...");
        try {
            let res;
            if (currentMode === 'register') {
                await authService.register(targetEmail, otpString, registrationData);
                res = await authService.verifyFinal(targetEmail, otpString);
            } else {
                res = await authService.verifyFinal(targetEmail, otpString);
            }

            // This kicks off the context update in the background
            login(res.data);
            toast.success("Verification successful!", {id: toastId});

            // Use the role DIRECTLY from the API response for navigation.
            // This avoids any race conditions with the React context.
            const userRole = res.data.role;
            
            if (userRole === 'ROLE_SELECTION_PENDING') {
                // New user: Go to home page for onboarding.
                // { replace: true } prevents user from going back to the OTP page.
                navigate('/', { replace: true });
            } else {
                // Existing user: Go to the dashboard.
                navigate('/dashboard', { replace: true });
            }

        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP.", {id: toastId});
        }
    };

    return (
        <AuthLayout title="Final Verification" subtitle={`Enter code sent to ${targetEmail}`}>
            <form onSubmit={handleVerify} className="space-y-8 mt-6">
                <div className="flex justify-between gap-2">
                    {otp.map((data, index) => (
                        <input key={index} ref={el => inputs.current[index] = el} type="text" maxLength="1" value={data}
                               onChange={e => handleChange(e, index)} onKeyDown={e => handleKeyDown(e, index)}
                               className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl border-gray-200 focus:border-bidstream-blue focus:ring-4 focus:ring-bidstream-blue/10 outline-none transition-all"/>
                    ))}
                </div>
                <Button type="submit">Verify & Complete</Button>
            </form>
        </AuthLayout>
    );
};

export default VerifyOtpPage;