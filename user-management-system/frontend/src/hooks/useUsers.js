import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../api/users';
import toast from 'react-hot-toast';

export function useUsers(initialParams = {}) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState({ page: 1, limit: 10, search: '', ...initialParams });

  const fetchUsers = useCallback(async (queryParams) => {
    setIsLoading(true);
    try {
      const res = await usersAPI.getAll(queryParams || params);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchUsers(); }, [params]);

  const updateParams = useCallback((updates) => {
    setParams(p => ({ ...p, ...updates, page: updates.page ?? 1 }));
  }, []);

  return { users, pagination, isLoading, params, updateParams, refetch: fetchUsers };
}

export function useUser(id) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await usersAPI.getById(id);
      setUser(res.data.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return { user, isLoading, refetch: fetchUser, setUser };
}

export function useUserStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    usersAPI.getStats()
      .then(res => setStats(res.data.data.stats))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
