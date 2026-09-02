import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function UserManagement() {
    // ==========================================
    // DATA USER
    // ==========================================

    const [users, setUsers] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@rigops.com",
            role: "Admin",
            status: "Active",
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane.smith@rigops.com",
            role: "User/PIC",
            status: "Active",
        },
        {
            id: 3,
            name: "Robert Jones",
            email: "r.jones@rigops.com",
            role: "User/PIC",
            status: "Inactive",
        },
        {
            id: 4,
            name: "Alice Wong",
            email: "a.wong@rigops.com",
            role: "Admin",
            status: "Active",
        },
    ]);

    // ==========================================
    // SEARCH
    // ==========================================

    const [search, setSearch] = useState("");

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const keyword = search.toLowerCase();

            return (
                user.name.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                user.role.toLowerCase().includes(keyword) ||
                user.status.toLowerCase().includes(keyword)
            );
        });
    }, [users, search]);

    // ==========================================
    // MODAL
    // ==========================================

    const [showModal, setShowModal] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "User/PIC",
        status: "Active",
    });

    // ==========================================
    // NOTIFICATION
    // ==========================================

    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
            setMessage("");
        }, 2500);
    };

    // ==========================================
    // ADD USER
    // ==========================================

    const handleAddUser = () => {
        setEditingUser(null);

        setForm({
            name: "",
            email: "",
            role: "User/PIC",
            status: "Active",
        });

        setShowModal(true);
    };

    // ==========================================
    // EDIT USER
    // ==========================================

    const handleEditUser = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });

        setShowModal(true);
    };

    // ==========================================
    // SAVE USER
    // ==========================================

    const handleSaveUser = () => {
        if (!form.name.trim() || !form.email.trim()) {
            showMessage("Nama dan email wajib diisi.");
            return;
        }

        if (editingUser) {
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === editingUser.id
                        ? {
                              ...user,
                              ...form,
                          }
                        : user
                )
            );

            showMessage("Data user berhasil diperbarui.");
        } else {
            const newUser = {
                id: Date.now(),
                ...form,
            };

            setUsers((currentUsers) => [
                ...currentUsers,
                newUser,
            ]);

            showMessage("User baru berhasil ditambahkan.");
        }

        setShowModal(false);
    };

    // ==========================================
    // DELETE USER
    // ==========================================

    const handleDeleteUser = (user) => {
        const confirmed = window.confirm(
            `Hapus user "${user.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setUsers((currentUsers) =>
            currentUsers.filter(
                (item) => item.id !== user.id
            )
        );

        showMessage("User berhasil dihapus.");
    };

    // ==========================================
    // TOGGLE STATUS
    // ==========================================

    const handleToggleStatus = (user) => {
        const newStatus =
            user.status === "Active"
                ? "Inactive"
                : "Active";

        setUsers((currentUsers) =>
            currentUsers.map((item) =>
                item.id === user.id
                    ? {
                          ...item,
                          status: newStatus,
                      }
                    : item
            )
        );

        showMessage(
            `${user.name} sekarang ${newStatus}.`
        );
    };

    // ==========================================
    // AVATAR
    // ==========================================

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7fb",
                fontFamily: "Arial, sans-serif",
                color: "#102033",
            }}
        >
            {/* =====================================
                SIDEBAR
            ===================================== */}

            <AdminSidebar />

            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main
                style={{
                    marginLeft: "200px",
                    minHeight: "100vh",
                }}
            >
                {/* =================================
                    HEADER
                ================================= */}

                <header
                    style={{
                        height: "62px",
                        backgroundColor: "#ffffff",
                        borderBottom:
                            "1px solid #d9e1e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        padding: "0 18px",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#00583b",
                        }}
                    >
                        User Administration
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >
                        <button
                            onClick={() =>
                                showMessage(
                                    "Tidak ada notifikasi baru."
                                )
                            }
                            style={iconButton}
                        >
                            ♧
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Halaman User Management."
                                )
                            }
                            style={iconButton}
                        >
                            ?
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Login sebagai Rig HSE Admin."
                                )
                            }
                            style={iconButton}
                        >
                            ◎
                        </button>
                    </div>
                </header>

                {/* =================================
                    CONTENT
                ================================= */}

                <div
                    style={{
                        padding: "18px",
                    }}
                >
                    {/* TITLE + ACTION */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            marginBottom: "14px",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "25px",
                                    color: "#101828",
                                }}
                            >
                                User Administration
                            </h1>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    fontSize: "15px",
                                    color: "#667085",
                                }}
                            >
                                Manage rig personnel access,
                                roles, and system status.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            {/* SEARCH */}

                            <div
                                style={{
                                    width: "185px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    border:
                                        "1px solid #d0d5dd",
                                    borderRadius: "4px",
                                    backgroundColor:
                                        "#ffffff",
                                    padding:
                                        "0 9px",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#667085",
                                        fontSize: "17px",
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search users..."
                                    style={{
                                        border:
                                            "none",
                                        outline:
                                            "none",
                                        width:
                                            "100%",
                                        marginLeft:
                                            "7px",
                                        fontSize: "15px",
                                    }}
                                />
                            </div>

                            {/* ADD USER */}

                            <button
                                onClick={
                                    handleAddUser
                                }
                                style={{
                                    ...primaryButton,
                                    height: "32px",
                                }}
                            >
                                ＋ Add User
                            </button>
                        </div>
                    </div>

                    {/* =================================
                        USER TABLE
                    ================================= */}

                    <section
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            overflow: "hidden",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse:
                                    "collapse",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor:
                                            "#eef2f6",
                                    }}
                                >
                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Name
                                    </th>

                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Email
                                    </th>

                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Role
                                    </th>

                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Status
                                    </th>

                                    <th
                                        style={{
                                            ...tableHeader,
                                            textAlign:
                                                "right",
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.length >
                                0 ? (
                                    filteredUsers.map(
                                        (user) => (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                                style={{
                                                    borderBottom:
                                                        "1px solid #e1e6eb",
                                                }}
                                            >
                                                {/* NAME */}

                                                <td
                                                    style={
                                                        tableCell
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "9px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width:
                                                                    "24px",
                                                                height:
                                                                    "24px",
                                                                borderRadius:
                                                                    "50%",
                                                                backgroundColor:
                                                                    "#dcefe7",
                                                                color:
                                                                    "#00583b",
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                fontSize: "12px",
                                                                fontWeight:
                                                                    "700",
                                                            }}
                                                        >
                                                            {getInitials(
                                                                user.name
                                                            )}
                                                        </div>

                                                        <span>
                                                            {
                                                                user.name
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* EMAIL */}

                                                <td
                                                    style={{
                                                        ...tableCell,
                                                        color:
                                                            "#475467",
                                                    }}
                                                >
                                                    {
                                                        user.email
                                                    }
                                                </td>

                                                {/* ROLE */}

                                                <td
                                                    style={
                                                        tableCell
                                                    }
                                                >
                                                    <span
                                                        style={
                                                            roleBadge
                                                        }
                                                    >
                                                        {
                                                            user.role
                                                        }
                                                    </span>
                                                </td>

                                                {/* STATUS */}

                                                <td
                                                    style={
                                                        tableCell
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                user
                                                            )
                                                        }
                                                        style={{
                                                            border:
                                                                "none",
                                                            background:
                                                                "transparent",
                                                            cursor:
                                                                "pointer",
                                                            padding:
                                                                "0",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "6px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width:
                                                                    "6px",
                                                                height:
                                                                    "6px",
                                                                borderRadius:
                                                                    "50%",
                                                                backgroundColor:
                                                                    user.status ===
                                                                    "Active"
                                                                        ? "#18b77a"
                                                                        : "#d11a2a",
                                                            }}
                                                        />

                                                        <span
                                                            style={{
                                                                color:
                                                                    user.status ===
                                                                    "Active"
                                                                        ? "#344054"
                                                                        : "#b42318",
                                                                fontSize: "15px",
                                                            }}
                                                        >
                                                            {
                                                                user.status
                                                            }
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* ACTIONS */}

                                                <td
                                                    style={{
                                                        ...tableCell,
                                                        textAlign:
                                                            "right",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "flex-end",
                                                            gap:
                                                                "6px",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleEditUser(
                                                                    user
                                                                )
                                                            }
                                                            style={
                                                                actionButton
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user
                                                                )
                                                            }
                                                            style={{
                                                                fontWeight: "700",
...actionButton,
                                                                color:
                                                                    "#b42318",
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            style={{
                                                padding:
                                                    "30px",
                                                textAlign:
                                                    "center",
                                                color:
                                                    "#667085",
                                                fontSize: "16px",
                                            }}
                                        >
                                            User tidak
                                            ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* =================================
                            FOOTER
                        ================================= */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                padding:
                                    "9px 12px",
                                backgroundColor:
                                    "#fafbfc",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "13px",
                                    color:
                                        "#667085",
                                }}
                            >
                                Showing{" "}
                                {filteredUsers.length}{" "}
                                to{" "}
                                {filteredUsers.length}{" "}
                                of{" "}
                                {users.length}{" "}
                                entries
                            </span>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "4px",
                                }}
                            >
                                <button
                                    disabled
                                    style={
                                        paginationButton
                                    }
                                >
                                    Previous
                                </button>

                                <button
                                    style={{
                                        ...paginationButton,
                                        backgroundColor:
                                            "#00583b",
                                        color:
                                            "#ffffff",
                                    }}
                                >
                                    1
                                </button>

                                <button
                                    disabled
                                    style={
                                        paginationButton
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* =====================================
                ADD / EDIT MODAL
            ===================================== */}

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(15, 23, 42, 0.35)",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: "390px",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "7px",
                            boxShadow:
                                "0 15px 40px rgba(0,0,0,0.2)",
                            padding: "20px",
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    "0 0 5px",
                                fontSize: "22px",
                                color:
                                    "#101828",
                            }}
                        >
                            {editingUser
                                ? "Edit User"
                                : "Add User"}
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 18px",
                                fontSize: "15px",
                                color:
                                    "#667085",
                            }}
                        >
                            {editingUser
                                ? "Update user information."
                                : "Add a new user to the system."}
                        </p>

                        {/* NAME */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Name
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Enter name"
                            style={
                                modalInput
                            }
                        />

                        {/* EMAIL */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Email
                        </label>

                        <input
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Enter email"
                            style={
                                modalInput
                            }
                        />

                        {/* ROLE */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Role
                        </label>

                        <select
                            value={form.role}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    role:
                                        e.target
                                            .value,
                                })
                            }
                            style={
                                modalInput
                            }
                        >
                            <option>
                                Admin
                            </option>

                            <option>
                                User/PIC
                            </option>
                        </select>

                        {/* STATUS */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Status
                        </label>

                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status:
                                        e.target
                                            .value,
                                })
                            }
                            style={
                                modalInput
                            }
                        >
                            <option>
                                Active
                            </option>

                            <option>
                                Inactive
                            </option>
                        </select>

                        {/* MODAL BUTTON */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap:
                                    "8px",
                                marginTop:
                                    "20px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                style={{
                                    ...secondaryButton,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleSaveUser
                                }
                                style={
                                    primaryButton
                                }
                            >
                                {editingUser
                                    ? "Save Changes"
                                    : "Add User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================
                NOTIFICATION
            ===================================== */}

            {message && (
                <div
                    style={{
                        position:
                            "fixed",
                        right: "25px",
                        bottom: "25px",
                        backgroundColor:
                            "#00583b",
                        color: "#ffffff",
                        padding:
                            "11px 17px",
                        borderRadius: "5px",
                        fontSize: "15px",
                        fontWeight: "600",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,0.2)",
                        zIndex: 10000,
                    }}
                >
                    ✓ {message}
                </div>
            )}
        </div>
    );
}

// ==============================================
// STYLES
// ==============================================

const iconButton = {
    border: "none",
    background: "transparent",
    color: "#00583b",
    cursor: "pointer",
    fontSize: "20px",
};

const primaryButton = {
    border: "none",
    backgroundColor: "#00583b",
    color: "#ffffff",
    padding: "0 13px",
    height: "34px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
};

const secondaryButton = {
    border: "1px solid #d0d5dd",
    backgroundColor: "#ffffff",
    color: "#344054",
    padding: "0 13px",
    height: "34px",
    borderRadius: "4px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
};

const tableHeader = {
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "12px",
    color: "#475467",
    fontWeight: "700",
};

const tableCell = {
    padding: "8px 10px",
    fontSize: "15px",
    color: "#172033",
};

const roleBadge = {
    display: "inline-block",
    backgroundColor: "#e9eef2",
    border: "1px solid #d6dde3",
    color: "#475467",
    borderRadius: "10px",
    padding: "3px 7px",
    fontSize: "12px",
};

const actionButton = {
    border: "none",
    background: "transparent",
    color: "#00583b",
    fontSize: "13px",
    cursor: "pointer",
    padding: "3px 5px",
};

const paginationButton = {
    border: "1px solid #d0d5dd",
    backgroundColor: "#ffffff",
    color: "#667085",
    borderRadius: "3px",
    padding: "4px 7px",
    fontSize: "12px",
};

const modalLabel = {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#344054",
    marginBottom: "5px",
};

const modalInput = {
    width: "100%",
    height: "34px",
    boxSizing: "border-box",
    border: "1px solid #d0d5dd",
    borderRadius: "4px",
    padding: "0 9px",
    marginBottom: "12px",
    outline: "none",
    fontSize: "15px",
    backgroundColor: "#ffffff",
};