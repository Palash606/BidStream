import { useAuthStore } from "../stores";
import BidderNavbar from "../components/dashboard/BidderNavbar.jsx";
import SellerNavbar from "../components/dashboard/SellerNavbar.jsx";
import CategoryRibbon from "../components/dashboard/CategoryRibbon.jsx";

const DashboardLayout = ({ children }) => {
    const user = useAuthStore((state) => state.user);

    return (
        <div
            className={`min-h-screen transition-colors duration-500 ${user?.activeRole === 'ROLE_SELLER' ? 'dark bg-slate-950' : 'bg-white'}`}>
            <div>
                {user?.activeRole === 'ROLE_SELLER' ? <SellerNavbar /> : <BidderNavbar />}
                {user?.activeRole !== 'ROLE_SELLER' && <CategoryRibbon />}
                <main className="mx-auto max-w-[1400px] px-6 py-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;