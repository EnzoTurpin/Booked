import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import authService from "../services/auth";
import axios from "axios";

const API_URL = "http://localhost:5000/api/professional";

const daysOfWeek = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const ProfessionalDashboard: React.FC = () => {
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchWorkingHours();
    fetchAppointments();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const token = authService.getToken();
      const res = await axios.get(`${API_URL}/working-hours`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkingHours(res.data);
    } catch (e) {}
  };

  const fetchAppointments = async () => {
    try {
      const token = authService.getToken();
      const res = await axios.get(
        `http://localhost:5000/api/appointments/professional/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data);
      setLoading(false);
    } catch (e) {}
  };

  const handleAccept = async (id: string) => {
    const token = authService.getToken();
    await axios.patch(
      `http://localhost:5000/api/appointments/${id}/accept`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  const handleRefuse = async (id: string) => {
    const token = authService.getToken();
    await axios.patch(
      `http://localhost:5000/api/appointments/status/${id}`,
      { status: "cancelled" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  const handleWorkingHourChange = async (
    day: number,
    field: string,
    value: string | boolean
  ) => {
    const wh = workingHours.find((w) => w.day === day) || {
      day,
      isWorking: false,
      startTime: "09:00",
      endTime: "18:00",
    };
    const updated = { ...wh, [field]: value };
    const token = authService.getToken();
    await axios.put(`${API_URL}/working-hours`, updated, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchWorkingHours();
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord professionnel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendrier et horaires */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Calendrier mensuel</h2>
          <div className="mb-4">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              inline
              className="w-full"
            />
          </div>
          <h3 className="mt-6 text-lg font-semibold">Horaires de travail</h3>
          <table className="w-full mt-2 border">
            <thead>
              <tr>
                <th>Jour</th>
                <th>Travaille</th>
                <th>Début</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day, idx) => {
                const wh = workingHours.find((w) => w.day === idx) || {};
                return (
                  <tr key={idx}>
                    <td>{day}</td>
                    <td>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={wh.isWorking || false}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                idx,
                                "isWorking",
                                e.target.checked
                              )
                            }
                          />
                          <div
                            className={`block w-10 h-6 rounded-full transition-colors ease-in-out duration-200 ${
                              wh.isWorking ? "bg-sage" : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ease-in-out duration-200 ${
                              wh.isWorking ? "transform translate-x-4" : ""
                            }`}
                          ></div>
                        </div>
                        <div
                          className={`ml-3 text-brown font-medium ${
                            !wh.isWorking ? "opacity-60" : ""
                          }`}
                        >
                          {wh.isWorking ? "Ouvert" : "Fermé"}
                        </div>
                      </label>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={wh.startTime || "09:00"}
                        disabled={!wh.isWorking}
                        onChange={(e) =>
                          handleWorkingHourChange(
                            idx,
                            "startTime",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={wh.endTime || "18:00"}
                        disabled={!wh.isWorking}
                        onChange={(e) =>
                          handleWorkingHourChange(
                            idx,
                            "endTime",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Rendez-vous */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Rendez-vous à traiter</h2>
          {loading ? (
            <div>Chargement...</div>
          ) : appointments.length === 0 ? (
            <div>Aucun rendez-vous à traiter.</div>
          ) : (
            <ul className="divide-y mt-2">
              {appointments
                .filter((a) => a.status === "pending")
                .map((a) => (
                  <li key={a._id} className="py-3 flex flex-col gap-1">
                    <div>
                      <b>
                        {a.clientId?.firstName} {a.clientId?.lastName}
                      </b>{" "}
                      - {new Date(a.date).toLocaleDateString()} {a.startTime} -{" "}
                      {a.endTime}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded"
                        onClick={() => handleAccept(a._id)}
                        disabled={a.status !== "pending"}
                      >
                        Accepter
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleRefuse(a._id)}
                        disabled={a.status === "cancelled"}
                      >
                        Refuser
                      </button>
                      <span className="ml-2 text-sm">Statut : {a.status}</span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
