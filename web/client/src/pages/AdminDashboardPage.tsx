import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";
import userService, { IExtendedUser } from "../services/user";

interface UserTableProps {
  users: IExtendedUser[];
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: IExtendedUser) => void;
}

interface EditUserModalProps {
  user: IExtendedUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: IExtendedUser) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
  onEditUser,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vérifié
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.isEmailVerified ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Vérifié
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Non vérifié
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.isBanned ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Banni
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Actif
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                <button
                  onClick={() => onEditUser(user)}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-md"
                >
                  Modifier
                </button>
                {user.isBanned ? (
                  <button
                    onClick={() => onUnbanUser(user._id)}
                    className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-md"
                  >
                    Débannir
                  </button>
                ) : (
                  <button
                    onClick={() => onBanUser(user._id)}
                    className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded-md"
                  >
                    Bannir
                  </button>
                )}
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
                      )
                    ) {
                      onDeleteUser(user._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<IExtendedUser | null>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  if (!isOpen || !formData) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Modifier l'utilisateur</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Téléphone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="client">Client</option>
                <option value="professional">Professionnel</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<IExtendedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IExtendedUser | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"users" | "unbanRequests">(
    "users"
  );
  const [unbanRequests, setUnbanRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();

    // Redirect if not logged in or not admin
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }

    fetchUsers();
    fetchUnbanRequests();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err: any) {
      setError(
        err.message ||
          "Une erreur s'est produite lors du chargement des utilisateurs"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUnbanRequests = async () => {
    try {
      setLoadingRequests(true);
      const fetchedRequests = await userService.getUnbanRequests();
      setUnbanRequests(fetchedRequests);
      setRequestError(null);
    } catch (err: any) {
      setRequestError(
        err.message ||
          "Une erreur s'est produite lors du chargement des demandes de débanissement"
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      await userService.banUser(userId);
      // Update the user list
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isBanned: true } : user
        )
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors du bannissement de l'utilisateur");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await userService.unbanUser(userId);
      // Update the user list
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isBanned: false } : user
        )
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors du débannissement de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      // Remove user from list
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleEditUser = (user: IExtendedUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser: IExtendedUser) => {
    try {
      const result = await userService.updateUser(updatedUser._id, updatedUser);
      // Update user in the list
      setUsers(
        users.map((user) => (user._id === updatedUser._id ? result : user))
      );
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await userService.approveUnbanRequest(requestId);
      // Mettre à jour la liste des demandes
      setUnbanRequests(
        unbanRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "approved" }
            : request
        )
      );
      // Actualiser la liste des utilisateurs
      fetchUsers();
    } catch (err: any) {
      setRequestError(
        err.message || "Erreur lors de l'approbation de la demande"
      );
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await userService.rejectUnbanRequest(requestId);
      // Mettre à jour la liste des demandes
      setUnbanRequests(
        unbanRequests.map((request) =>
          request._id === requestId
            ? { ...request, status: "rejected" }
            : request
        )
      );
    } catch (err: any) {
      setRequestError(err.message || "Erreur lors du rejet de la demande");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Tableau de bord administrateur
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {requestError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {requestError}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab("unbanRequests")}
              className={`${
                activeTab === "unbanRequests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Demandes de débanissement
              {unbanRequests.filter((req) => req.status === "pending").length >
                0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                  {
                    unbanRequests.filter((req) => req.status === "pending")
                      .length
                  }
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === "users" && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-3">
              Gestion des utilisateurs
            </h2>
            <div className="flex justify-between mb-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : (
              <UserTable
                users={filteredUsers}
                onBanUser={handleBanUser}
                onUnbanUser={handleUnbanUser}
                onDeleteUser={handleDeleteUser}
                onEditUser={handleEditUser}
              />
            )}
          </div>
        )}

        {activeTab === "unbanRequests" && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-3">
              Demandes de débanissement
            </h2>

            {loadingRequests ? (
              <div className="text-center py-4">Chargement...</div>
            ) : unbanRequests.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  Aucune demande de débanissement pour le moment
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de demande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unbanRequests.map((request) => (
                      <tr key={request._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.user ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {request.user.firstName} {request.user.lastName}
                              </div>
                              <div className="text-gray-500">
                                {request.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              Utilisateur inconnu
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(request.createdAt).toLocaleDateString()}{" "}
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {request.message}
                          </div>
                          <button
                            onClick={() => alert(request.message)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Voir tout
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.status === "pending" ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              En attente
                            </span>
                          ) : request.status === "approved" ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approuvée
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rejetée
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproveRequest(request._id)
                                }
                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-md"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md"
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default AdminDashboardPage;
