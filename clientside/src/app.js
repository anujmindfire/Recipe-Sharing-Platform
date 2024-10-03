import React from 'react';
import { Box } from '@chakra-ui/react';
import { Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom'; 
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import RecipePage from './pages/RecipePage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';

function App() {
  return (
    <Box>
      <Routes>
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/signin' element={<SignInPage />} />
        {/* <Route path='/profile' element={<ProfilePage />} /> */}
        <Route path='/recipes' element={<RecipePage />} />
        <Route exact path='/recipe/:id' element={<RecipeDetailsPage />} />
        <Route path='/*' element={<Navigate to='/signin' />} />
      </Routes>
    </Box>
  );
}

export default App;