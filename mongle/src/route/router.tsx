import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../page/HomePage';
import Login from '../page/Login';
import Signup from '../page/Signup';
import AiConsult from '../page/AiConsultationPage';
import SleepContent from '../page/SleepContentPage';

export const router =
    createBrowserRouter([
        {
            path: '/',
            element:
                <HomePage />,
        },
        {
            path: '/login',
            element:
                <Login />
        },
        {
            path: '/signup',
            element:
                <Signup />
        },
        {
            path: '/aiConsult',
            element:
                <AiConsult />
        },
        {
            path: '/SleepContent',
            element:
                <SleepContent />
        }
    ])
