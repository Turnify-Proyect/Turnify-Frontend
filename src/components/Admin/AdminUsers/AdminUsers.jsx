import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import {
  fetchUsers,
  fetchUserById,
  createUserApi,
  updateUserApi,
  deactivateUserApi,
  activateUserApi,
  updateUserRolesApi,
} from "./adminUsersApi";

import "./AdminUsers.css";

const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "client",
  country: "",
  city: "",
  address: "",
};

const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
};

const getRoleLabel = (role) => {
  if (role === "admin") return "Administrador";
  if (role === "professional") return "Profesional";
  if (role === "client") return "Cliente";

  return role;
};

const getRolesLabel = (roles = []) => {
  if (!roles || roles.length === 0) return "-";

  return roles.map(getRoleLabel).join(", ");
};

const AdminUsers = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState(
    EMPTY_EDIT_FORM
  );

  // Roles que se están editando en el modal de detalle
  const [editRoles, setEditRoles] = useState([]);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [createForm, setCreateForm] = useState(
    EMPTY_CREATE_FORM
  );

  const getUsers = async () => {
    try {
      setError("");

      const data = await fetchUsers(
        token,
        page,
        5,
        search,
        role,
        status
      );

      setUsers(data.users);

      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(
        err.message ||
          "Ocurrió un error al obtener los usuarios."
      );
    }
  };

  useEffect(() => {
    getUsers();
  }, [token, page, search, role, status]);

  const openUserDetail = async (user) => {
    try {
      setError("");

      const data = await fetchUserById(
        user.id,
        token
      );

      setSelectedUser(data);

      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        country: data.country || "",
        city: data.city || "",
        address: data.address || "",
      });

      setEditRoles(data.roles || []);

      setIsEditing(false);
    } catch (err) {
      setError(
        err.message ||
          "No se pudo obtener el detalle del usuario."
      );
    }
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setEditForm(EMPTY_EDIT_FORM);
    setEditRoles([]);
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRoleChange = (roleToChange) => {
    setEditRoles((currentRoles) => {
      if (currentRoles.includes(roleToChange)) {
        return currentRoles.filter(
          (currentRole) =>
            currentRole !== roleToChange
        );
      }

      return [...currentRoles, roleToChange];
    });
  };

  const cancelEditing = () => {
    if (!selectedUser) return;

    setEditForm({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      phone: selectedUser.phone || "",
      country: selectedUser.country || "",
      city: selectedUser.city || "",
      address: selectedUser.address || "",
    });

    setEditRoles(selectedUser.roles || []);

    setIsEditing(false);
    setError("");
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    if (editRoles.length === 0) {
      setError(
        "El usuario debe tener al menos un rol."
      );
      return;
    }

    if (
      editRoles.includes("client") &&
      editRoles.includes("professional")
    ) {
      setError(
        "Un usuario no puede ser cliente y profesional al mismo tiempo."
      );
      return;
    }

    try {
      setError("");

      // Actualiza los datos generales del usuario
      await updateUserApi(
        selectedUser.id,
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          country:
            editForm.country || undefined,
          city: editForm.city || undefined,
          address:
            editForm.address || undefined,
        },
        token
      );

      // Los roles se modifican por el endpoint
      // exclusivo para administración de roles
      await updateUserRolesApi(
        selectedUser.id,
        editRoles,
        token
      );

      // Volvemos a consultar el usuario para
      // mostrar los datos definitivos del backend
      const updatedUser =
        await fetchUserById(
          selectedUser.id,
          token
        );

      setSelectedUser(updatedUser);

      setEditForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        country: updatedUser.country || "",
        city: updatedUser.city || "",
        address: updatedUser.address || "",
      });

      setEditRoles(updatedUser.roles || []);

      setIsEditing(false);

      await getUsers();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo actualizar el usuario."
      );
    }
  };

  const changeUserStatus = async () => {
    if (!selectedUser) return;

    try {
      setError("");

      if (selectedUser.isActive) {
        await deactivateUserApi(
          selectedUser.id,
          token
        );
      } else {
        await activateUserApi(
          selectedUser.id,
          token
        );
      }

      const updatedUser =
        await fetchUserById(
          selectedUser.id,
          token
        );

      setSelectedUser(updatedUser);
      setEditRoles(updatedUser.roles || []);

      await getUsers();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo modificar el estado del usuario."
      );
    }
  };

  const openCreateModal = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setError("");
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const createUser = async () => {
    try {
      setError("");

      await createUserApi(
        {
          name: createForm.name,
          email: createForm.email,
          phone: createForm.phone,
          password: createForm.password,
          confirmPassword:
            createForm.confirmPassword,

          roles: [createForm.role],

          country:
            createForm.country || undefined,
          city: createForm.city || undefined,
          address:
            createForm.address || undefined,
        },
        token
      );

      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);

      setPage(1);

      await getUsers();
    } catch (err) {
      setError(
        err.message ||
          "No se pudo crear el usuario."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Usuarios</h1>

          <p>
            Administrá los usuarios registrados en la
            plataforma.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="admin-filters">
        <input
          type="text"
          className="admin-search"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="admin-filter-select"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            Todos los roles
          </option>

          <option value="client">
            Cliente
          </option>

          <option value="professional">
            Profesional
          </option>

          <option value="admin">
            Administrador
          </option>
        </select>

        <select
          className="admin-filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            Todos los estados
          </option>

          <option value="true">
            Activo
          </option>

          <option value="false">
            Inactivo
          </option>
        </select>

        <button
          type="button"
          className="admin-create-button"
          onClick={openCreateModal}
        >
          + Crear nuevo
        </button>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* TABLA */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Usuarios registrados</h2>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{user.phone}</td>

                    <td>
                      {getRolesLabel(
                        user.roles
                      )}
                    </td>

                    <td>
                      <span
                        className={`user-status ${
                          user.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {user.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-detail-button"
                        onClick={() =>
                          openUserDetail(user)
                        }
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-empty"
                  >
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="users-pagination">
          <span className="users-pagination-info">
            {pagination.total === 0
              ? "No hay usuarios"
              : `${pagination.total} usuario${
                  pagination.total !== 1
                    ? "s"
                    : ""
                }`}
          </span>

          <div className="users-pagination-controls">
            <button
              type="button"
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
              disabled={page === 1}
            >
              Anterior
            </button>

            <span>
              Página {page} de{" "}
              {pagination.totalPages || 1}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              disabled={
                pagination.totalPages === 0 ||
                page >=
                  pagination.totalPages
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* DETALLE / EDICIÓN */}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={closeUserModal}
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  Detalle del usuario
                </h2>

                <p>
                  {selectedUser.email}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeUserModal}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-modal-body">

                {error && (
                  <div className="admin-error">
                    {error}
                  </div>
                )}

                <div className="user-form-grid">

                  {/* NOMBRE */}
                  <label>
                    Nombre

                    {isEditing ? (
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {selectedUser.name}
                      </strong>
                    )}
                  </label>

                  {/* EMAIL */}
                  <label>
                    Email

                    {isEditing ? (
                      <input
                        name="email"
                        type="email"
                        value={
                          editForm.email
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {
                          selectedUser.email
                        }
                      </strong>
                    )}
                  </label>

                  {/* TELÉFONO */}
                  <label>
                    Teléfono

                    {isEditing ? (
                      <input
                        name="phone"
                        value={
                          editForm.phone
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {
                          selectedUser.phone
                        }
                      </strong>
                    )}
                  </label>

                  {/* ESTADO */}
                  <label>
                    Estado

                    <span
                      className={`user-status ${
                        selectedUser.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {selectedUser.isActive
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </label>

                  {/* PAÍS */}
                  <label>
                    País

                    {isEditing ? (
                      <input
                        name="country"
                        value={
                          editForm.country
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {selectedUser.country ||
                          "-"}
                      </strong>
                    )}
                  </label>

                  {/* CIUDAD */}
                  <label>
                    Ciudad

                    {isEditing ? (
                      <input
                        name="city"
                        value={
                          editForm.city
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {selectedUser.city ||
                          "-"}
                      </strong>
                    )}
                  </label>

                  {/* DIRECCIÓN */}
                  <label>
                    Dirección

                    {isEditing ? (
                      <input
                        name="address"
                        value={
                          editForm.address
                        }
                        onChange={
                          handleEditChange
                        }
                      />
                    ) : (
                      <strong>
                        {selectedUser.address ||
                          "-"}
                      </strong>
                    )}
                  </label>

                  {/* ROLES */}
                  {!isEditing && (
                    <label>
                      Roles

                      <strong>
                        {getRolesLabel(
                          selectedUser.roles
                        )}
                      </strong>
                    </label>
                  )}
                </div>

                {/* EDICIÓN DE ROLES */}
                {isEditing && (
                  <div className="user-role-group">
                    <span>Roles</span>

                    <div className="user-role-options">

                      {/* CLIENTE */}
                      <label
                        className={`user-role-option ${
                          editRoles.includes(
                            "professional"
                          )
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editRoles.includes(
                            "client"
                          )}
                          disabled={editRoles.includes(
                            "professional"
                          )}
                          onChange={() =>
                            handleRoleChange(
                              "client"
                            )
                          }
                        />

                        Cliente
                      </label>

                      {/* PROFESIONAL */}
                      <label className="user-role-option disabled">
                        <input
                          type="checkbox"
                          checked={editRoles.includes(
                            "professional"
                          )}
                          disabled
                        />

                        Profesional
                      </label>

                      {/* ADMIN */}
                      <label className="user-role-option">
                        <input
                          type="checkbox"
                          checked={editRoles.includes(
                            "admin"
                          )}
                          onChange={() =>
                            handleRoleChange(
                              "admin"
                            )
                          }
                        />

                        Administrador
                      </label>
                    </div>

                    <small className="user-role-help">
                      El rol Profesional se
                      administra desde la gestión
                      de profesionales.
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* ACCIONES DEL MODAL */}
            <div className="admin-modal-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={
                      cancelEditing
                    }
                  >
                    Cancelar edición
                  </button>

                  <button
                    type="button"
                    className="admin-action-primary"
                    onClick={
                      saveUserChanges
                    }
                  >
                    Guardar cambios
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={
                      selectedUser.isActive
                        ? "admin-action-danger"
                        : "admin-action-primary"
                    }
                    onClick={
                      changeUserStatus
                    }
                  >
                    {selectedUser.isActive
                      ? "Desactivar usuario"
                      : "Activar usuario"}
                  </button>

                  <button
                    type="button"
                    className="admin-action-secondary"
                    onClick={() => {
                      setEditRoles(
                        selectedUser.roles ||
                          []
                      );

                      setIsEditing(true);
                      setError("");
                    }}
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREAR USUARIO */}
      {showCreateModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeCreateModal}
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>Crear usuario</h2>

                <p>
                  Registrá una nueva cuenta en
                  Turnify.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeCreateModal}
              >
                ×
              </button>
            </div>

            <div className="admin-modal-scroll">
              <div className="admin-modal-body">

                {error && (
                  <div className="admin-error">
                    {error}
                  </div>
                )}

                <div className="user-form-grid">

                  <label>
                    Nombre *

                    <input
                      name="name"
                      value={
                        createForm.name
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Email *

                    <input
                      name="email"
                      type="email"
                      value={
                        createForm.email
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Teléfono *

                    <input
                      name="phone"
                      value={
                        createForm.phone
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Rol *

                    <select
                      name="role"
                      value={
                        createForm.role
                      }
                      onChange={
                        handleCreateChange
                      }
                    >
                      <option value="client">
                        Cliente
                      </option>

                      <option value="professional">
                        Profesional
                      </option>

                      <option value="admin">
                        Administrador
                      </option>
                    </select>
                  </label>

                  <label>
                    Contraseña *

                    <input
                      name="password"
                      type="password"
                      value={
                        createForm.password
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Confirmar contraseña *

                    <input
                      name="confirmPassword"
                      type="password"
                      value={
                        createForm.confirmPassword
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    País

                    <input
                      name="country"
                      value={
                        createForm.country
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Ciudad

                    <input
                      name="city"
                      value={
                        createForm.city
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>

                  <label>
                    Dirección

                    <input
                      name="address"
                      value={
                        createForm.address
                      }
                      onChange={
                        handleCreateChange
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-action-secondary"
                onClick={closeCreateModal}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-action-primary"
                onClick={createUser}
              >
                Crear usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;