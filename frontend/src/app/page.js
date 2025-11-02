'use client'
import { useState, useEffect } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">用户列表-llq</h1>
        
        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-500">加载中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">暂无用户数据</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">用户名</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">邮箱</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
