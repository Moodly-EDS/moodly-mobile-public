import React, { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import {
    View,
    Button,
    ScrollView,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator
} from 'react-native';

// Interface Report
interface Report {
    id: string;
    mood: string;
    reasons: string;
    created_at: string;
    // Ajoute les autres colonnes de ta table
}

const Dashboard = () => {
    const [totalusers, setTotalusers] = useState(0);
    const [managers, setManagers] = useState(0);
    const [employees, setEmployees] = useState(0);
    const [admin, setAdmin] = useState(0);
   
    useEffect(() => {
        const fetchAllCounts = async () => {
            try {
                // Total users
                const { count: totalCount, error: totalError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true }); // head: true pour optimiser
                if (totalError) {
                    console.log("Erreur total users:", totalError);
                } else {
                    setTotalusers(totalCount ?? 0);
                }

                // Count by roles
                const roles = ['manager', 'employee', 'superadmin'];
                const roleCounts = await Promise.all(
                    roles.map(async (role) => {
                        const { count, error } = await supabase
                            .from('profiles')
                            .select('*', { count: 'exact', head: true })
                            .eq('account_type', role);
                        
                        if (error) {
                            console.log(`Erreur pour role ${role}:`, error);
                            return 0;
                        }
                        return count ?? 0;
                    })
                );
    
                setManagers(roleCounts[0]);
                setEmployees(roleCounts[1]);
                setAdmin(roleCounts[2]);
            } catch (error) {
                console.log("Erreur générale:", error);
            }
        };
    
        fetchAllCounts();
    }, []);
    
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Corrigé: setError

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setReports(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
                console.log(err); // Corrigé: err au lieu de error
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);



    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="flex-1 justify-center items-center p-6">
                <View className="w-full max-w-sm">
                    <View className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                        <Text className="text-xl font-bold text-center text-gray-800 mb-2">Total users</Text>
                        <Text className="text-3xl font-bold text-center text-blue-600">{totalusers}</Text>
                    </View>

                    <View className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-center text-gray-700 mb-2">Managers</Text>
                        <Text className="text-2xl font-bold text-center text-green-600">{managers}</Text>
                    </View>

                    <View className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-center text-gray-700 mb-2">Employees</Text>
                        <Text className="text-2xl font-bold text-center text-orange-600">{employees}</Text>
                    </View>

                    <View className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                        <Text className="text-lg font-semibold text-center text-gray-700 mb-2">Admin</Text>
                        <Text className="text-2xl font-bold text-center text-red-600">{admin}</Text>
                    </View>

                    {/* SECTION REPORTS */}
                    <View className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            Reports ({reports.length})
                        </Text>
    
                        {loading && <ActivityIndicator size="large" color="#3B82F6" />}
    
                        {error && <Text className="text-red-600 text-center">{error}</Text>}
    
                        {!loading && !error && reports.map((report) => (
                        <View key={report.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-2">{report.mood}</Text>
                            <Text className="text-sm text-gray-600 mb-2">{report.reasons}</Text>
                             <Text className="text-xs text-gray-400">
                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                            </Text>
                    </View>
                         ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Dashboard;