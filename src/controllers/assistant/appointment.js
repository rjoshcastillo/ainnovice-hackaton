// Usage in an async function
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
export async function generateSlots(clinicStart, clinicEnd) {
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const clinicStartMinutes = timeToMinutes(clinicStart);
    const clinicEndMinutes = timeToMinutes(clinicEnd);

    const slots = [];
    for (let time = clinicStartMinutes; time + 30 <= clinicEndMinutes; time += 30) {
        slots.push({ start: time, end: time + 30 });
    }

    return slots;
}

// Usage in an async function
export async function findAvailableSlots(appointments, clinicStart, clinicEnd) {
    const slots = await generateSlots(clinicStart, clinicEnd);

    // The rest of your logic goes here...
    const availableSlots = slots.filter(slot => {
        return !appointments.some(appointment => {
            const appointmentStart = timeToMinutes(appointment.start);
            const appointmentEnd = timeToMinutes(appointment.end);
            return (slot.start < appointmentEnd && slot.end > appointmentStart);
        });
    });

    return availableSlots.map(slot => ({
        start: `${Math.floor(slot.start / 60).toString().padStart(2, '0')}:${(slot.start % 60).toString().padStart(2, '0')}`,
        end: `${Math.floor(slot.end / 60).toString().padStart(2, '0')}:${(slot.end % 60).toString().padStart(2, '0')}`
    }));
}

export async function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0'); // Get hours and pad with zero if needed
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with zero if needed
    return `${hours}:${minutes}`; // Format as HH:mm
}
