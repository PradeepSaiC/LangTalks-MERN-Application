import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'
import OnBoardingPage from './pages/OnBoardingPage'
import { Toaster } from 'react-hot-toast'
import PageLoader from './compnents/PageLoader'
import useAuthUser from './hooks/useAuthUser'
import Layout from './compnents/Layout'
import { useThemeStore } from './store/useThemeStore'
const App = () => {
  const {isLoading,authUser} = useAuthUser();
  const {theme} = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  if (isLoading){
    return (
      <PageLoader/>
    )
  }
  return (
    <div data-theme={theme} className="h-screen">
      <Routes>
        <Route path='/' element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true}>
            <HomePage />
          </Layout>
        ) : (
          <Navigate to={isAuthenticated ? '/onboarding' : '/login'}/>
        )}/>
        <Route path='/signup' element={!isAuthenticated ? <SignUpPage />:  <Navigate to={
          isOnboarded ? '/' : '/onboarding'
        }/>}/>
        <Route path='/login' element={!isAuthenticated ? <LoginPage /> : <Navigate to={
          isOnboarded ? '/' : '/onboarding'
        }/>}/>
        <Route path='/notifications' element={isAuthenticated  && isOnboarded ? (
          <Layout showSidebar={true}>
            <NotificationPage />
          </Layout>
        ) : (
          <Navigate to={isAuthenticated ? '/onboarding' : '/login'}/>
       )} />
        <Route path='/call/:id' element={isAuthenticated && isOnboarded ?
          (<Layout showSidebar={false}>
            <CallPage />
          </Layout>):
          (
            <Navigate to={isAuthenticated ? '/onboarding' : '/login'}/>
          )
          }/>
        <Route path='/chat/:id' element={isAuthenticated && isOnboarded ?
          (<Layout showSidebar={false}>
            <ChatPage />
          </Layout>):
          (
            <Navigate to={isAuthenticated ? '/onboarding' : '/login'}/>
          )
        }/>
        <Route path='/onboarding' element={isAuthenticated ?(
          !isOnboarded ? <OnBoardingPage /> : <Navigate to="/"/>
        ):(
          <Navigate to="/login"/>
        )}/>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App