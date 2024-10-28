import db from "../../database/db.config.js"; // Usage in an async function

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
export async function generateSlots(clinicStart, clinicEnd) {
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const clinicStartMinutes = timeToMinutes(clinicStart);
  const clinicEndMinutes = timeToMinutes(clinicEnd);

  const slots = [];
  for (
    let time = clinicStartMinutes;
    time + 30 <= clinicEndMinutes;
    time += 30
  ) {
    slots.push({ start: time, end: time + 30 });
  }

  return slots;
}

// Usage in an async function
export async function findAvailableSlots(
  appointments,
  clinicStart,
  clinicEnd,
  preferredTime
) {
  const slots = await generateSlots(clinicStart, clinicEnd);

  const amSlot = slots.filter((s) => {
    return s.start <= timeToMinutes("12:00");
  });
  const pmSlot = slots.filter((s) => {
    return s.start >= timeToMinutes("13:00");
  });

  const slotByPreferrence = preferredTime === "AM" ? amSlot : pmSlot;

  const availableSlots = slotByPreferrence.filter((slot) => {
    /* Removed Lunch Time from Available Slots */
    /* Added preferredTime */
    /* AM - Return all slot before 12:00  */
    /* PM - Return all slot before 13:00  */
    const isLunchTime =
      slot.start < timeToMinutes("13:00") && slot.end > timeToMinutes("12:00");
    return (
      !appointments.some((appointment) => {
        const appointmentStart = timeToMinutes(appointment.start);
        const appointmentEnd = timeToMinutes(appointment.end);
        return slot.start < appointmentEnd && slot.end > appointmentStart;
      }) && !isLunchTime
    );
  });

  return availableSlots.map((slot) => ({
    start: `${Math.floor(slot.start / 60)
      .toString()
      .padStart(2, "0")}:${(slot.start % 60).toString().padStart(2, "0")}`,
    end: `${Math.floor(slot.end / 60)
      .toString()
      .padStart(2, "0")}:${(slot.end % 60).toString().padStart(2, "0")}`,
  }));
}

export async function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0"); // Get hours and pad with zero if needed
  const minutes = String(now.getMinutes()).padStart(2, "0"); // Get minutes and pad with zero if needed
  return `${hours}:${minutes}`; // Format as HH:mm
}

export function scheduleAppointments(appointments, currentTime) {
  // Sort appointments based on urgency and created_at
  appointments.sort((a, b) => {
    if (a.status === "Ongoing" && b.status !== "Ongoing") return 1; // Ongoing appointments will be adjusted later
    if (b.status === "Ongoing" && a.status !== "Ongoing") return -1;
    if (a.urgency > b.urgency) return -1;
    if (a.urgency < b.urgency) return 1;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const scheduled = [];

  // Handle completed appointments first
  appointments.forEach((appointment) => {
    if (appointment.status === "Completed") {
      // For completed appointments, set the start and end based on the current time
      appointment.appointment_start = currentTime;
      appointment.appointment_end = calculateEndTime(
        appointment.appointment_start,
        appointment.estimate
      );
      scheduled.push(appointment); // Add completed appointment to the schedule
      currentTime = appointment.appointment_end; // Update current time to the end of this appointment
    }
  });

  // Handle ongoing appointments after completed ones
  appointments.forEach((appointment) => {
    if (appointment.status === "Ongoing") {
      // Find the last completed appointment to place the ongoing appointment after it
      const lastCompletedIndex = scheduled.length - 1; // Get the last completed appointment
      if (lastCompletedIndex >= 0) {
        // Set the start time of ongoing to the end of the last completed appointment
        appointment.appointment_start =
          scheduled[lastCompletedIndex].appointment_end;
      } else {
        // If no completed appointments, set ongoing to current time
        appointment.appointment_start = currentTime;
      }
      appointment.appointment_end = calculateEndTime(
        appointment.appointment_start,
        appointment.estimate
      );
      scheduled.push(appointment); // Add ongoing appointment to the schedule
      currentTime = appointment.appointment_end; // Update current time to the end of the ongoing appointment
    }
  });

  // Handle waiting appointments
  appointments.forEach((appointment) => {
    if (appointment.status === "Waiting") {
      // Set start and end based on the current time
      appointment.appointment_start = currentTime;
      appointment.appointment_end = calculateEndTime(
        appointment.appointment_start,
        appointment.estimate
      );
      scheduled.push(appointment);
      currentTime = appointment.appointment_end; // Update current time to the end of this appointment
    }
  });

  return scheduled;
}
function calculateEndTime(startTime, estimate) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endTime = new Date();
  endTime.setHours(hours);
  endTime.setMinutes(minutes + estimate);

  return endTime.toTimeString().slice(0, 5); // Format as HH:mm
}

export async function processScheduleAppointment(payload) {
  const getAllAppointmentsByDateAndDoctorId =
    "SELECT * FROM appointments WHERE appointment_date = ? AND doctor_id = ?";

  try {
    const appointments = await new Promise((resolve, reject) => {
      db.query(
        getAllAppointmentsByDateAndDoctorId,
        [payload.appointmentDate, payload.doctorId],
        (err, results) => {
          if (err) {
            console.error("Error fetching appointments:", err);
            return reject(new Error("Error fetching appointments"));
          }
          resolve(results);
        }
      );
    });

    const getDoh =
      "SELECT * FROM doctor_operating_hours WHERE doctor_id = ? AND day = ?";

    const doh = await new Promise((resolve, reject) => {
      db.query(
        getDoh,
        [payload.doctorId, payload.appointmentDate],
        (err, results) => {
          if (err) {
            console.error("Error fetching doctor operating hours:", err);
            return reject(new Error("Error fetching doctor operating hours"));
          }
          resolve(results);
        }
      );
    });

    const scheduledAppointments = scheduleAppointments(
      appointments,
      doh[0].hours_start
    );

    const updateQueries = scheduledAppointments.map((appointment) => {
      return new Promise((resolve, reject) => {
        const updateQuery = `
          UPDATE appointments 
          SET appointment_start = ?, appointment_end = ? 
          WHERE appointment_id = ?`;
        db.query(
          updateQuery,
          [
            appointment.appointment_start,
            appointment.appointment_end,
            appointment.appointment_id,
          ],
          (error) => {
            if (error) {
              reject(new Error("Error updating appointment"));
            } else {
              resolve();
            }
          }
        );
      });
    });

    await Promise.all(updateQueries);
    return {
      result: scheduledAppointments,
      message: "Appointments scheduled successfully",
    };
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
}
