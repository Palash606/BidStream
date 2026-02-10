import React, {useState, useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {motion, AnimatePresence} from 'framer-motion';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {ChevronLeft} from 'lucide-react';
import toast from "react-hot-toast";
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CountryCodeSelector from '../components/ui/CountryCodeSelector';
import countryData from '../lib/countries.json';
import {authService} from '../api/authService';

const schema = z.object({
    username: z.string().min(3, "Required: 3+ characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    panCard: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format (e.g., ABCDE1234F)"),
    countryCode: z.string().default("+91"),
    phoneNumber: z.string().min(10, "10 digits required"),
    street: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    state: z.string().min(1, "Required"),
    zipCode: z.string().min(5, "Invalid Zip"),
    country: z.string().min(1, "Required"),
    password: z.string()
        .min(8, "8+ Chars, Upper, Lower, Num, Special")
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
        formState: {errors, touchedFields},
        trigger
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: {countryCode: "+91"}
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        ['email', 'firstName', 'lastName'].forEach(field => {
            const val = params.get(field);
            if (val) setValue(field, val);
        });
    }, [location, setValue]);

    // Inside RegisterPage.jsx
    const checkUsernameAvailability = async () => {
        const username = getValues('username');
        if (username.length < 3) return false;

        try {
            await authService.checkUsername(username);
            clearErrors('username');
            return true;
        } catch (error) {
            // FIX: Only show "taken" if the status is 409.
            // Otherwise, show a generic communication error.
            if (error.response?.status === 409) {
                setError('username', {type: 'manual', message: 'This username is already taken'});
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
            // Additional async check for Step 1
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
            await authService.sendOtp(data.email);
            toast.success("Details saved! Check your email.", {id: toastId});
            navigate('/verify-otp', {state: {registrationData: data, mode: 'register'}});
        } catch (error) {
            if (error.response?.status === 200) {
                navigate('/verify-otp', {state: {registrationData: data, mode: 'register'}});
                toast.dismiss(toastId);
            } else {
                toast.error("Identity Service communication error.", {id: toastId});
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={<div className="flex flex-col items-center"><Link to="/login"
                                                                     className="mb-2 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-bidstream-blue transition-all cursor-pointer"><ChevronLeft
                size={14}/> Back to Login</Link><span
                className="text-3xl font-extrabold text-bidstream-dark tracking-tight">Create Account</span></div>}
            subtitle={`Step ${step} of 4`}
        >
            <div className="w-full bg-gray-100 h-1 rounded-full mb-8 overflow-hidden">
                <motion.div className="bg-bidstream-blue h-full" animate={{width: `${(step / 4) * 100}%`}}
                            transition={{duration: 0.5}}/>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{opacity: 0, x: 10}} animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: -10}} transition={{duration: 0.2}}>
                        {step === 1 && (
                            <div className="space-y-4">
                                <Input
                                    label="Username"
                                    {...register("username")}
                                    onBlur={checkUsernameAvailability} // Real-time feedback
                                    error={errors.username?.message}
                                />
                                <Input label="Email" type="email" {...register("email")} error={errors.email?.message}/>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" {...register("firstName")}
                                           error={touchedFields.firstName && errors.firstName?.message}/>
                                    <Input label="Last Name" {...register("lastName")}
                                           error={touchedFields.lastName && errors.lastName?.message}/>
                                </div>
                                <Input label="PAN Card" {...register("panCard")}
                                       onInput={e => e.target.value = e.target.value.toUpperCase()}
                                       error={touchedFields.panCard && errors.panCard?.message}/>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-4">
                                        <Controller name="countryCode" control={control} render={({field}) => (
                                            <CountryCodeSelector countries={countryData} value={field.value}
                                                                 onChange={field.onChange}/>
                                        )}/>
                                    </div>
                                    <div className="col-span-8">
                                        <Input label="Phone Number" {...register("phoneNumber")}
                                               error={touchedFields.phoneNumber && errors.phoneNumber?.message}/>
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-4">
                                <Input label="Street" {...register("street")}
                                       error={touchedFields.street && errors.street?.message}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="City" {...register("city")}
                                           error={touchedFields.city && errors.city?.message}/>
                                    <Input label="State" {...register("state")}
                                           error={touchedFields.state && errors.state?.message}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Zip" {...register("zipCode")}
                                           error={touchedFields.zipCode && errors.zipCode?.message}/>
                                    <Input label="Country" {...register("country")}
                                           error={touchedFields.country && errors.country?.message}/>
                                </div>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="space-y-4">
                                <Input label="Secure Password" type="password" {...register("password")}
                                       error={touchedFields.password && errors.password?.message}/>
                                <Input label="Confirm Password" type="password" {...register("confirmPassword")}
                                       error={touchedFields.confirmPassword && errors.confirmPassword?.message}/>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 pt-6">
                    {step > 1 &&
                        <Button variant="outline" type="button" onClick={() => setStep(s => s - 1)}>Previous</Button>}
                    {step < 4 ? (
                        <Button type="button" onClick={nextStep}>Continue</Button>
                    ) : (
                        <Button type="submit"
                                disabled={loading}>{loading ? "Processing..." : "Finish Registration"}</Button>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;