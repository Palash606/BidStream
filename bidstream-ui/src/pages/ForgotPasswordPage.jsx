import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Link} from 'react-router-dom';
import {ChevronLeft, Mail} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import {authService} from '../api/authService';

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
});

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const {register, handleSubmit, formState: {errors, isSubmitSuccessful}} = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading("Processing request...");
        try {
            // Using existing axios instance to call /auth/forgot-password?email=...
            await authService.forgotPassword(data.email);
            toast.success("Reset link sent!", {id: toastId});
        } catch (error) {
            toast.error("User not found or service error.", {id: toastId});
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitSuccessful) {
        return (
            <AuthLayout title="Check Email" subtitle="Reset instructions sent.">
                <div className="flex flex-col items-center py-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Mail className="text-bidstream-blue" size={32}/>
                    </div>
                    <p className="text-sm text-gray-500 text-center mb-8">We've sent a recovery link to your inbox.
                        Check your spam folder if you don't see it.</p>
                    <Link to="/login" className="w-full"><Button variant="outline">Back to Login</Button></Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Reset Password" subtitle="We'll send you instructions.">
            <div className="flex justify-start mb-2">
                <Link to="/login"
                      className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-bidstream-blue cursor-pointer transition-all">
                    <ChevronLeft size={14}/> Back to Login
                </Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <Input label="Email address" {...register("email")} error={errors.email?.message}
                       placeholder="name@company.com"/>
                <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;