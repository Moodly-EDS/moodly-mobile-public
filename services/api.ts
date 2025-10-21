import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://unwavering-nurture-b5b95b1a3b.strapiapp.com/api';

// Types matching Strapi enums
export type StrapiMood = 'very_bad' | 'bad' | 'okay' | 'good' | 'very_good';
export type StrapiReason = 'Workload' | 'Collaboration' | 'Recognition' | 'Autonomy' | 'Focus' | 'Personal' | 'Other';
export type AccountType = 'employee' | 'manager' | 'superadmin';

export interface StrapiUser {
    id: number;
    username: string;
    email: string;
    account_type: AccountType;
}

export interface StrapiReport {
    id: number;
    date: string;
    mood: StrapiMood;
    reason: StrapiReason[];
    user: {
        data: {
            id: number;
            attributes: StrapiUser;
        };
    };
}

interface LoginResponse {
    jwt: string;
    user: StrapiUser;
}

class ApiService {
    private token: string | null = null;

    async init() {
        this.token = await AsyncStorage.getItem('@moodly_token');
    }

    private async getHeaders() {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Auth
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: email,
                password,
            }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data: LoginResponse = await response.json();
        this.token = data.jwt;
        await AsyncStorage.setItem('@moodly_token', data.jwt);
        await AsyncStorage.setItem('@moodly_user', JSON.stringify(data.user));

        return data;
    }

    async register(username: string, email: string, password: string, accountType: 'employee' | 'manager'): Promise<LoginResponse> {
        // Step 1: Register the user (without account_type)
        const registerResponse = await fetch(`${API_URL}/auth/local/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });

        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            throw new Error(error.error?.message || 'Registration failed');
        }

        const registerData: LoginResponse = await registerResponse.json();
        this.token = registerData.jwt;

        // Step 2: Update the user with account_type
        const updateResponse = await fetch(`${API_URL}/users/${registerData.user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
            body: JSON.stringify({
                account_type: accountType,
            }),
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.error?.message || 'Failed to set account type');
        }

        await updateResponse.json();

        const userData: StrapiUser = {
            ...registerData.user,
            account_type: accountType,
        }; await AsyncStorage.setItem('@moodly_token', this.token);
        await AsyncStorage.setItem('@moodly_user', JSON.stringify(userData));

        return {
            jwt: this.token,
            user: userData,
        };
    }

    async logout() {
        this.token = null;
        await AsyncStorage.removeItem('@moodly_token');
        await AsyncStorage.removeItem('@moodly_user');
    }

    async getCurrentUser(): Promise<StrapiUser | null> {
        const userStr = await AsyncStorage.getItem('@moodly_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Reports
    async createReport(mood: StrapiMood, reasons: StrapiReason[]): Promise<StrapiReport> {
        const headers = await this.getHeaders();
        const user = await this.getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const today = new Date().toISOString().split('T')[0];

        console.log('Creating report:', { mood, reasons, userId: user.id });

        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                data: {
                    date: today,
                    mood,
                    reason: reasons,
                    connect: [user.id]
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Create report error:', error);
            throw new Error(error.error?.message || 'Failed to create report');
        }

        const data = await response.json();
        return data.data;
    }

    async getMyReports(): Promise<StrapiReport[]> {
        const headers = await this.getHeaders();
        const user = await this.getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(
            `${API_URL}/reports?filters[user][id][$eq]=${user.id}&sort=date:desc&populate=user`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Fetch reports error:', error);
            throw new Error(error.error?.message || 'Failed to fetch reports');
        }

        const data = await response.json();
        console.log('Reports fetched:', data);
        return data.data;
    }

    async hasReportToday(): Promise<boolean> {
        const headers = await this.getHeaders();
        const user = await this.getCurrentUser();

        if (!user) {
            return false;
        }

        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `${API_URL}/reports?filters[user][id][$eq]=${user.id}&filters[date][$eq]=${today}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.data.length > 0;
    }

    async getTodayReport(): Promise<StrapiReport | null> {
        const headers = await this.getHeaders();
        const user = await this.getCurrentUser();

        if (!user) {
            return null;
        }

        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `${API_URL}/reports?filters[user][id][$eq]=${user.id}&filters[date][$eq]=${today}&populate=user`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data.length > 0 ? data.data[0] : null;
    }

    // Manager: Get all reports (aggregated)
    async getAllReports(startDate?: string, endDate?: string): Promise<StrapiReport[]> {
        const headers = await this.getHeaders();
        const user = await this.getCurrentUser();

        if (!user || user.account_type !== 'manager') {
            throw new Error('Unauthorized');
        }

        let url = `${API_URL}/reports?sort=date:desc&populate=user`;

        if (startDate) {
            url += `&filters[date][$gte]=${startDate}`;
        }
        if (endDate) {
            url += `&filters[date][$lte]=${endDate}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        return data.data;
    }
}

export const apiService = new ApiService();
