import { BrowserRouter,Route,Routes } from 'react-router';
import Home from './components/Home/Home';
import UserProvider from './components/UserProvider/UserProvider';

function App() {
  return (<div>
    <BrowserRouter>
    <UserProvider>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      </UserProvider>
     </BrowserRouter>
  </div>)
}

export default App;
