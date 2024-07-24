import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import AddCustomer from './components/AddCustomer';
import ImportCustomers from './components/ImportCustomers';
import WorkLog from './components/WorkLog';

function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App container-fluid">
        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar">
            <div className="sidebar-sticky">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link to="/customers" className="nav-link">고객 목록</Link>
                </li>
                <li className="nav-item">
                  <Link to="/worklog" className="nav-link">업무일지</Link>
                </li>
              </ul>
            </div>
          </nav>

          <main className="col-md-10 ml-sm-auto px-4">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/customers"
                element={isAuthenticated() ? <CustomerList /> : <Navigate to="/" />}
              />
              <Route
                path="/customers/:id"
                element={isAuthenticated() ? <CustomerDetail /> : <Navigate to="/" />}
              />
              <Route
                path="/add-customer"
                element={isAuthenticated() ? <AddCustomer /> : <Navigate to="/" />}
              />
              <Route
                path="/import-customers"
                element={isAuthenticated() ? <ImportCustomers /> : <Navigate to="/" />}
              />
              <Route
                path="/worklog"
                element={isAuthenticated() ? <WorkLog /> : <Navigate to="/" />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;