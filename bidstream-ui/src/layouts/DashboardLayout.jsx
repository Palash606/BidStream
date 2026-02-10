import {useAuth} from "../context/AuthContext.jsx";
import BidderNavbar from "../components/dashboard/BidderNavbar.jsx";
import SellerNavbar from "../components/dashboard/SellerNavbar.jsx";
import CategoryRibbon from "../components/dashboard/CategoryRibbon.jsx";

const DashboardLayout = ({children}) => {
    const {user} = useAuth();

    return (
        <div
            className={`min-h-screen transition-colors duration-500 ${user?.role === 'SELLER' ? 'dark bg-slate-950' : 'bg-white'}`}>
            <div>
                {user?.role === 'SELLER' ? <SellerNavbar/> : <BidderNavbar/>}
                {user?.role !== 'SELLER' && <CategoryRibbon/>}
                <main className="mx-auto max-w-[1400px] px-6 py-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;