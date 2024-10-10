import { backendURL } from '../api/url';

export const refreshAccessToken = async (refreshtoken, userId, navigate) => {
    try {
        const response = await fetch(`${backendURL}/auth/refreshtoken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                refreshtoken,
                id: userId,
            },
        });

        const data = await response.json();

        if (!response.ok && response.status === 401 && data.logout) {
            clearLocalStorage();
            navigate('/signin');
            return null;
        } else if (response.ok && response.status === 200) {
            localStorage.setItem('accesstoken', data.accessToken);
            return data.accessToken;
        } else if (!response.ok && response.status === 401 && data.signout) {
            clearLocalStorage();
            navigate('/signin');
            return null;
        }
    } catch (error) {
        return null;
    }
};

const clearLocalStorage = () => {
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
};