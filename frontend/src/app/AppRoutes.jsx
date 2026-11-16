import { Routes, Route } from 'react-router-dom';
import MainLayout  from '../layout/MainLayout';

import Login from '../auth/Login'
import Company from '../pages/master/Company'
import Suppliers from '../pages/master/Suppliers'
import Customers from '../pages/master/Customers';
import Products from '../pages/master/Products';

import POList from '../pages/purchase/POList';
import GRN from '../pages/purchase/GRN'

import StockBalance from '../pages/inventory/StockBalance'
import StockLedger from '../pages/inventory/StockLedger'

import SalesOrder from '../pages/sales/SalesOrder'

import Invoice from '../pages/dispatch/Invoice'

import Help from '../pages/Help/Help'

export default function AppRoutes() {
    return (
        <Routes>

            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Main Application */}
            <Route element={<MainLayout />}>

                <Route 
                    path="/master/company" 
                    element={ 
                        <Company /> 
                    } 
                />

                <Route 
                    path="/master/suppliers" 
                    element={ 
                        <Suppliers /> 
                    }
                />

                <Route path="/master/customers" 
                    element={  
                        <Customers /> 
                    }
                />

                <Route path="/master/products" 
                    element={ 
                        <Products /> 
                    }
                />

                <Route path="/purchase/POList" 
                    element={ 
                        <POList />  
                    }
                />

                <Route path="/purchase/grn" 
                    element={ 
                        <GRN /> 
                    }
                />

                <Route path="/inventory/stock-balance" 
                    element={ 
                        <StockBalance />
                    }
                />

                <Route path="/inventory/stock-ledger" 
                    element={ 
                        <StockLedger /> 
                    }
                />

                <Route path="/sales/sales-order" 
                    element={ 
                        <SalesOrder /> 
                    }
                />

                <Route path="/dispatch/invoice" 
                    element={ 
                       <Invoice /> 
                    }
                />

                <Route path="/help/help" 
                    element={ 
                        <Help /> 
                    }
                />

            </Route>

        </Routes>
    );
}