import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useNavigate, useSearchParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import {authService} from '../api/authService';

const schema = z.object({
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        if (!token) {
            toast.error("Invalid or expired reset token.");
            return;
        }

        const toastId = toast.loading("Updating password...");
        try {
            // Matches /auth/reset-password?token=...&newPassword=...
            await authService.resetPassword(token, data.password);
            toast.success("Password updated! Please login.", {id: toastId});
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error("Link has expired. Please request a new one.", {id: toastId});
        }
    };

    return (
        <AuthLayout title="New Password" subtitle="Set your new secure access code.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="New Password" type="password" {...register("password")} error={errors.password?.message}/>
                <Input label="Confirm New Password" type="password" {...register("confirmPassword")}
                       error={errors.confirmPassword?.message}/>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Update Password"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;