import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ManagerNavbar } from '@/components/ManagerNavbar';

// Interface User
interface User {
  id: string;
  email: string;
  username: string;
  account_type: 'employee' | 'manager' | 'superadmin';
  created_at: string;
}

const SuperAdminDashboard = () => {
  const [totalusers, setTotalusers] = useState(0);
  const [managers, setManagers] = useState(0);
  const [employees, setEmployees] = useState(0);
  const [admins, setAdmins] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All roles');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user counts
      const { count: totalCount, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.log('Erreur total users:', totalError);
      } else {
        setTotalusers(totalCount ?? 0);
      }

      // Fetch counts by role
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
      setAdmins(roleCounts[2]);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setUsers(usersData || []);
      setFilteredUsers(usersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'All roles') {
      filtered = filtered.filter((user) => {
        if (selectedRole === 'Managers') return user.account_type === 'manager';
        if (selectedRole === 'Employees') return user.account_type === 'employee';
        if (selectedRole === 'Admins') return user.account_type === 'superadmin';
        return true;
      });
    }

    // Filter by search text
    if (searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  }, [searchText, selectedRole, users]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'text-blue-600';
      case 'employee':
        return 'text-slate-700';
      case 'superadmin':
        return 'text-red-600';
      default:
        return 'text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Manager';
      case 'employee':
        return 'Employee';
      case 'superadmin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  return (
    <View className='flex-1 bg-white'>
      <ScrollView className='flex-1' contentContainerClassName='pb-32'>
        {/* Header */}
        <View className='mt-18 px-6'>
          <View className='mb-2 flex-row items-center justify-between'>
            <Text className='font-inter-bold text-2xl text-slate-900'>User Management</Text>
            <View className='rounded-full bg-red-50 px-3 py-1'>
              <Text className='font-inter-semibold text-xs text-red-600'>Super Admin</Text>
            </View>
          </View>
          <Text className='font-inter-regular text-sm text-slate-500'>
            Manage user roles and team assignments
          </Text>
        </View>

        {/* Stats Cards */}
        <View className='mt-6 px-6'>
          <View className='mb-3 flex-row justify-between'>
            <View className='mr-2 flex-1 rounded-2xl border border-blue-100 bg-blue-50 p-4'>
              <Ionicons name='people-outline' size={20} color='#3b82f6' />
              <Text className='font-inter-medium mt-2 text-xs text-blue-600'>Total Users</Text>
              <Text className='font-inter-bold text-2xl text-blue-600'>{totalusers}</Text>
            </View>
            <View className='ml-2 flex-1 rounded-2xl border border-green-100 bg-green-50 p-4'>
              <Ionicons name='shield-outline' size={20} color='#22c55e' />
              <Text className='font-inter-medium mt-2 text-xs text-green-600'>Managers</Text>
              <Text className='font-inter-bold text-2xl text-green-600'>{managers}</Text>
            </View>
          </View>
          <View className='flex-row justify-between'>
            <View className='mr-2 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <Ionicons name='person-outline' size={20} color='#64748b' />
              <Text className='font-inter-medium mt-2 text-xs text-slate-600'>Employees</Text>
              <Text className='font-inter-bold text-2xl text-slate-700'>{employees}</Text>
            </View>
            <View className='ml-2 flex-1 rounded-2xl border border-red-100 bg-red-50 p-4'>
              <Ionicons name='star-outline' size={20} color='#ef4444' />
              <Text className='font-inter-medium mt-2 text-xs text-red-600'>Admins</Text>
              <Text className='font-inter-bold text-2xl text-red-600'>{admins}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className='mt-6 px-6'>
          <View className='flex-row items-center rounded-xl bg-slate-100 px-4 py-3'>
            <Ionicons name='search' size={20} color='#64748b' />
            <TextInput
              className='font-inter-regular ml-2 flex-1 text-sm text-slate-900'
              placeholder='Search users...'
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor='#94a3b8'
            />
          </View>
        </View>

        {/* Role Filter */}
        <View className='mt-4 px-6'>
          <TouchableOpacity
            className='flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3'
            activeOpacity={0.7}>
            <Text className='font-inter-regular text-sm text-slate-700'>{selectedRole}</Text>
            <Ionicons name='chevron-down' size={20} color='#64748b' />
          </TouchableOpacity>
        </View>

        {/* Add User Button */}
        <View className='mt-4 px-6'>
          <TouchableOpacity
            className='flex-row items-center justify-center rounded-xl bg-blue-600 py-4'
            activeOpacity={0.8}>
            <Ionicons name='add' size={20} color='#ffffff' />
            <Text className='font-inter-semibold ml-2 text-base text-white'>Add User</Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <View className='mt-6 px-6'>
          {loading ? (
            <View className='py-20'>
              <ActivityIndicator size='large' color='#3b82f6' />
            </View>
          ) : error ? (
            <Text className='font-inter-regular text-center text-sm text-red-600'>{error}</Text>
          ) : filteredUsers.length === 0 ? (
            <View className='items-center py-20'>
              <Ionicons name='people-outline' size={64} color='#cbd5e1' />
              <Text className='font-inter-semibold mt-4 text-lg text-slate-900'>
                No users found
              </Text>
              <Text className='font-inter-regular mt-2 text-sm text-slate-500'>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View
                key={user.id}
                className='mb-3 rounded-2xl border border-slate-200 bg-white p-4 active:opacity-70'>
                <View className='flex-row items-center'>
                  <View className='h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                    <Ionicons name='person' size={24} color='#3b82f6' />
                  </View>
                  <View className='ml-3 flex-1'>
                    <Text className='font-inter-semibold text-base text-slate-900'>
                      {user.username}
                    </Text>
                    <Text className='font-inter-regular text-sm text-slate-500'>{user.email}</Text>
                  </View>
                  <TouchableOpacity className='ml-2 p-2' activeOpacity={0.7}>
                    <Ionicons name='trash-outline' size={20} color='#ef4444' />
                  </TouchableOpacity>
                </View>
                <View className='mt-3 flex-row items-center'>
                  <View className='flex-1'>
                    <Text
                      className={`font-inter-medium text-sm ${getRoleColor(user.account_type)}`}>
                      {getRoleLabel(user.account_type)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Super Admin Access Info */}
        <View className='mx-6 mt-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
          <View className='flex-row'>
            <Ionicons name='shield-checkmark-outline' size={20} color='#64748b' />
            <View className='ml-3 flex-1'>
              <Text className='font-inter-semibold text-sm text-slate-900'>
                Super Admin Access:
              </Text>
              <Text className='font-inter-regular mt-1 text-xs leading-5 text-slate-600'>
                You can assign roles, manage teams, and configure user access. Changes take effect
                immediately.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ManagerNavbar activeTab='dashboard' />
    </View>
  );
};

export default SuperAdminDashboard;
