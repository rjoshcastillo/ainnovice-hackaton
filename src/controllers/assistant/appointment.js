// Usage in an async function
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
