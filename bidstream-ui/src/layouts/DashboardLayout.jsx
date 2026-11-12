import { useAuthStore } from "../stores";
import BidderNavbar from "../components/dashboard/BidderNavbar.jsx";
import SellerNavbar from "../components/dashboard/SellerNavbar.jsx";
import CategoryRibbon from "../components/dashboard/CategoryRibbon.jsx";

const DashboardLayout = ({ children, fullWidth = false }) => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div>
                {user?.activeRole === 'ROLE_SELLER' ? <SellerNavbar /> : <BidderNavbar />}
                {user?.activeRole !== 'ROLE_SELLER' && <CategoryRibbon />}
                <main className={fullWidth ? '' : 'mx-auto max-w-[1400px] px-6 py-10'}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;