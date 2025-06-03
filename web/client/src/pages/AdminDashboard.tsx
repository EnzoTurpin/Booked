import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isBanned: boolean;
}

interface BanNotification {
  _id: string;
  userId: string;
  username: string;
  reason: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<BanNotification[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des utilisateurs",
        severity: "error",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/admin/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;

    try {
      await axios.post(`/api/admin/ban/${selectedUser._id}`, {
        reason: banReason,
      });

      setSnackbar({
        open: true,
        message: "Utilisateur banni avec succès",
        severity: "success",
      });

      setBanDialogOpen(false);
      setBanReason("");
      fetchUsers();
      fetchNotifications();
    } catch (error) {
      console.error("Error banning user:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du bannissement",
        severity: "error",
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await axios.post(`/api/admin/unban/${userId}`);
      setSnackbar({
        open: true,
        message: "Utilisateur débanni avec succès",
        severity: "success",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du débannissement",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrateur
      </Typography>

      {/* Liste des utilisateurs */}
      <Paper sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Gestion des utilisateurs
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isBanned ? "Banni" : "Actif"}</TableCell>
                  <TableCell>
                    {!user.isBanned ? (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setSelectedUser(user);
                          setBanDialogOpen(true);
                        }}
                      >
                        Bannir
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUnbanUser(user._id)}
                      >
                        Débannir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Notifications de ban */}
      <Paper sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Notifications de bannissement
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Raison</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>{notification.username}</TableCell>
                  <TableCell>{notification.reason}</TableCell>
                  <TableCell>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog pour le bannissement */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle>Bannir un utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Raison du bannissement"
            fullWidth
            multiline
            rows={4}
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleBanUser} color="error">
            Confirmer le bannissement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
