import { BrowserRouter,Route,Routes } from 'react-router';
import Home from './components/Home/Home';
import UserProvider from './Provider/UserProvider/UserProvider';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ForgetPassword from './components/UpdatePassword/ForgetPassword';
import ResetPassword from './components/UpdatePassword/ResetPassword';
import GetVerified from './components/Verify/GetVerified';
import VerifyYourAccount from './components/Verify/VerifyYourAccount';

function App() {
  return (<div>
    <Toaster/>
    <BrowserRouter>
    <UserProvider>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/verify" element={<GetVerified/>} />
        <Route path="/verify-email/:token" element={<VerifyYourAccount/>} />
        <Route path="/forget-password" element={<ForgetPassword/>} />
        <Route path="/update-password/:token" element={<ResetPassword/>} />
      </Routes>
      </UserProvider>
     </BrowserRouter>
  </div>)
}

export default App;
