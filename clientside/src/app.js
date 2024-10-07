import React from 'react';
import { Box } from '@chakra-ui/react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import OTPVerification from './pages/OTP';
import ForgotPasswordPage from './pages/ForgotPassword';
import PasswordConfirmation from './pages/PasswordConfirmation';
import SignInPage from './pages/SignInPage';
import RecipePage from './pages/RecipePage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/footer.module.css';
import ProfilePage from './pages/ProfilePage';
import MyRecipes from './components/MyRecipes';
import ProfileList from './components/ProfileList';
import ShareMessage from './components/ShareMessage';
// import EditProfile from './components/EditProfile';

const App = () => {
  return (
    <Box>
      <Header />
      <Routes>
        <Route path='/' element={<Navigate to='/signin' />} />
        <Route element={<ProfilePage />}>
          <Route path='/profile/recipes' element={<MyRecipes />} />
          <Route path='/profile/favourites' element={<MyRecipes />} />
          <Route path='/profile/following' element={<ProfileList />} />
          <Route path='/profile/follower' element={<ProfileList />} />
          {/* <Route path='/profile/:userId' element={<EditProfile />} /> */}
          <Route path='/profile/list' element={<ProfileList />} />
          <Route path='/profile/share/message' element={<ShareMessage />} />
        </Route>
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/otp-verify' element={<OTPVerification />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route path='/forgot-password/:txnId' element={<PasswordConfirmation />} />
        <Route path='/signin' element={<SignInPage />} />
        <Route path='/recipes' element={<RecipePage />} />
        <Route path='/recipe/:id' element={<RecipeDetailsPage />} />
      </Routes>
      <Footer />
    </Box>
  );
};

export default App;
