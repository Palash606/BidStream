import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import toast from "react-hot-toast";
import AuthLayout from '../layouts/AuthLayout';
import CountryCodeSelector from '../components/ui/CountryCodeSelector';
import countryData from '../lib/countries.json';
import { authService } from '../api/authService';

const DarkInput = React.forwardRef(({ label, error, ...props }, ref) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300">
            {label}
        </label>
        <div className="relative">
            <input
                ref={ref}
                className={`w-full px-4 py-3.5 bg-slate-800/50 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                {...props}
            />
        </div>
        {error && <p className="text-red-400 text-xs mt-1 font-medium">{error}</p>}
    </div>
));

const DarkButtonPrimary = ({ children, disabled, onClick, type = "button" }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
    >
        {children}
    </motion.button>
);

const DarkButtonOutline = ({ children, disabled, onClick, type = "button" }) => (
    <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 1)" }}
        whileTap={{ scale: 0.98 }}
        type={type}
        disabled={disabled}
        onClick={onClick}
        className="w-full py-3 bg-transparent border border-slate-700 text-white font-bold rounded-xl hover:border-slate-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
    >
        {children}
    </motion.button>
);

const schema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    panCard: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Please enter a valid PAN card format (e.g., ABCDE1234F)"),
    countryCode: z.string().default("+91"),
    phoneNumber: z.string().min(10, "Please enter a valid 10-digit phone number"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    zipCode: z.string().min(5, "Please enter a valid ZIP/Postal code"),
    country: z.string().min(1, "Country is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character")
        .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[@$!%*?&]/),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        setError,
        clearErrors,
        formState: { errors, touchedFields },
        trigger
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: { countryCode: "+91" }
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        ['email', 'firstName', 'lastName'].forEach(field => {
            const val = params.get(field);
            if (val) setValue(field, val);
        });
    }, [location, setValue]);

    const checkUsernameAvailability = async () => {
        const username = getValues('username');
        if (username.length < 3) return false;

        try {
            await authService.checkUsername(username);
            clearErrors('username');
            return true;
        } catch (error) {
            if (error.response?.status === 409) {
                setError('username', { type: 'manual', message: 'This username is already taken' });
            } else {
                toast.error("Network error checking username. Please try again.");
            }
            return false;
        }
    };

    const nextStep = async () => {
        const fieldsByStep = [
            ['username', 'email'],
            ['firstName', 'lastName', 'panCard', 'phoneNumber'],
            ['street', 'city', 'state', 'zipCode', 'country'],
            ['password', 'confirmPassword']
        ];

        const isValid = await trigger(fieldsByStep[step - 1]);

        if (isValid) {
            if (step === 1) {
                const isAvailable = await checkUsernameAvailability();
                if (!isAvailable) return;
            }
            setStep(s => s + 1);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Processing your request...");
        try {
            await authService.initiateRegistration(data.email, data);
            toast.success("Details saved! OTP generated.", { id: toastId });
            navigate('/verify-otp', { state: { registrationData: data, mode: 'register' } });
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error(error.response.data || "Validation failed. Please check your details.", { id: toastId });
            } else if (error.response?.status === 200) {
                navigate('/verify-otp', { state: { registrationData: data, mode: 'register' } });
                toast.dismiss(toastId);
            } else {
                toast.error("Identity Service communication error.", { id: toastId });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={<div className="flex flex-col items-center"><Link to="/login"
                className="mb-2 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-400 transition-all cursor-pointer"><ChevronLeft
                    size={14} /> Back to Login</Link><span
                        className="text-2xl font-extrabold text-white tracking-tight">Create Account</span></div>}
            subtitle={`Step ${step} of 4`}
        >
            <div className="w-full bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
                <motion.div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.5 }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                        {step === 1 && (
                            <div className="space-y-4">
                                <DarkInput
                                    label="Username"
                                    placeholder="yourusername"
                                    {...register("username")}
                                    onBlur={checkUsernameAvailability}
                                    error={errors.username?.message}
                                />
                                <DarkInput label="Email address" placeholder="name@example.com" type="email" {...register("email")} error={errors.email?.message} />
                            </div>
                        )}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <DarkInput label="First Name" placeholder="John" {...register("firstName")}
                                        error={touchedFields.firstName && errors.firstName?.message} />
                                    <DarkInput label="Last Name" placeholder="Doe" {...register("lastName")}
                                        error={touchedFields.lastName && errors.lastName?.message} />
                                </div>
                                <DarkInput label="PAN Card" placeholder="ABCDE1234F" {...register("panCard")}
                                    onInput={e => e.target.value = e.target.value.toUpperCase()}
                                    error={touchedFields.panCard && errors.panCard?.message} />
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-4">
                                        <Controller name="countryCode" control={control} render={({ field }) => (
                                            <CountryCodeSelector countries={countryData} value={field.value}
                                                onChange={field.onChange} />
                                        )} />
                                    </div>
                                    <div className="col-span-8">
                                        <DarkInput label="Phone Number" placeholder="9876543210" {...register("phoneNumber")}
                                            error={touchedFields.phoneNumber && errors.phoneNumber?.message} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-4">
                                <DarkInput label="Street Address" placeholder="123 Main St" {...register("street")}
                                    error={touchedFields.street && errors.street?.message} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DarkInput label="City" placeholder="City" {...register("city")}
                                        error={touchedFields.city && errors.city?.message} />
                                    <DarkInput label="State/Province" placeholder="State" {...register("state")}
                                        error={touchedFields.state && errors.state?.message} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <DarkInput label="ZIP/Postal Code" placeholder="12345" {...register("zipCode")}
                                        error={touchedFields.zipCode && errors.zipCode?.message} />
                                    <DarkInput label="Country" placeholder="Country" {...register("country")}
                                        error={touchedFields.country && errors.country?.message} />
                                </div>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="space-y-4">
                                <DarkInput label="Secure Password" placeholder="••••••••" type="password" {...register("password")}
                                    error={touchedFields.password && errors.password?.message} />
                                <DarkInput label="Confirm Password" placeholder="••••••••" type="password" {...register("confirmPassword")}
                                    error={touchedFields.confirmPassword && errors.confirmPassword?.message} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 pt-6">
                    {step > 1 &&
                        <div className="w-1/3">
                            <DarkButtonOutline onClick={() => setStep(s => s - 1)}>Previous</DarkButtonOutline>
                        </div>
                    }
                    {step < 4 ? (
                        <div className={step > 1 ? "w-2/3" : "w-full"}>
                            <DarkButtonPrimary onClick={nextStep}>Continue</DarkButtonPrimary>
                        </div>
                    ) : (
                        <div className="w-2/3">
                            <DarkButtonPrimary type="submit"
                                disabled={loading}>{loading ? "Processing..." : "Finish Registration"}</DarkButtonPrimary>
                        </div>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;