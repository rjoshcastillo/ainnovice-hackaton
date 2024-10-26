export const processAppointment = `
    INSERT INTO appointments (
        appointment_id,
        patient_id,
        doctor_id,
        alcohol_consumption,
        smoking,
        height,
        weight,
        breathing_trouble,
        pain_level,
        pain_part,
        medical_concern,
        symptoms,
        temperature,
        appointment_date,
        appointment_start,
        appointment_end,
        estimate,
        urgency,
        status,
        created_at
    )
    WITH CTE AS (
        SELECT
            a.appointment_id, 
            a.patient_id,
            a.doctor_id, 
            a.alcohol_consumption,
            a.smoking,
            a.height,
            a.weight,
            a.breathing_trouble,
            a.pain_level,
            a.pain_part,
            a.medical_concern,
            a.symptoms,
            a.temperature,
            a.appointment_date, 
            a.estimate, 
            a.urgency, 
            d.hours_start,
            a.status,
            (EXTRACT(HOUR FROM d.hours_start) * 60) + EXTRACT(MINUTE FROM d.hours_start) AS doctor_schedule_start,
            a.created_at
        FROM 
            buffer_appointments AS a
        JOIN 
            doctor_operating_hours AS d 
        ON 
            a.doctor_id = d.doctor_id
        WHERE appointment_date = ? AND a.doctor_id = ?
        GROUP BY appointment_id
    ),
    CTE_Ranked AS (
        SELECT 
            appointment_id, 
            doctor_id, 
            patient_id,
            alcohol_consumption,
            smoking,
            height,
            weight,
            breathing_trouble,
            pain_level,
            pain_part,
            medical_concern,
            symptoms,
            temperature,
            appointment_date, 
            doctor_schedule_start,
            estimate, 
            urgency, 
            hours_start,
            status,
            created_at,
            CASE 
                WHEN urgency >= 9 THEN 1
                WHEN urgency >= 7 THEN 2
                ELSE 3
            END AS urgency_rank
        FROM 
            CTE
    ),
    CTE_Cumulative AS (
        SELECT 
            appointment_id, 
            doctor_id, 
            patient_id, 
            alcohol_consumption,
            smoking,
            height,
            weight,
            breathing_trouble,
            pain_level,
            pain_part,
            medical_concern,
            symptoms,
            temperature,
            appointment_date, 
            doctor_schedule_start,
            estimate, 
            urgency,
            hours_start,
            urgency_rank,
            ROW_NUMBER() OVER (ORDER BY urgency_rank, created_at) AS row_num, 
            SUM(estimate) OVER (ORDER BY urgency_rank, created_at) + COALESCE(doctor_schedule_start, 0) AS appointment_end,
            status,
            created_at
        FROM 
            CTE_Ranked
    )
    SELECT 
        appointment_id,
        patient_id,
        doctor_id,
        alcohol_consumption,
        smoking,
        height,
        weight,
        breathing_trouble,
        pain_level,
        pain_part,
        medical_concern,
        symptoms,
        temperature,
        appointment_date,
        CASE 
            WHEN row_num > 1 THEN 
                CONCAT(
                    LPAD(FLOOR(LAG(appointment_end) OVER (ORDER BY urgency_rank, created_at) / 60), 2, '0'), ':', 
                    LPAD(LAG(appointment_end) OVER (ORDER BY urgency_rank, created_at) % 60, 2, '0')
                )
            ELSE 
                CONCAT(
                    LPAD(FLOOR(doctor_schedule_start / 60), 2, '0'), ':', 
                    LPAD(doctor_schedule_start % 60, 2, '0')
                )
        END AS appointment_start,
        CONCAT(
            LPAD(FLOOR(appointment_end / 60), 2, '0'), ':', 
            LPAD(appointment_end % 60, 2, '0')
        ) AS appointment_end, 
        estimate, 
        urgency,
        status,
        created_at
    FROM 
        CTE_Cumulative
    ON DUPLICATE KEY UPDATE 
        patient_id = VALUES(patient_id),
        alcohol_consumption = VALUES(alcohol_consumption),
        smoking = VALUES(smoking),
        height = VALUES(height),
        weight = VALUES(weight),
        breathing_trouble = VALUES(breathing_trouble),
        pain_level = VALUES(pain_level),
        pain_part = VALUES(pain_part),
        medical_concern = VALUES(medical_concern),
        symptoms = VALUES(symptoms),
        temperature = VALUES(temperature),
        appointment_date = VALUES(appointment_date),
        appointment_start = VALUES(appointment_start),
        appointment_end = VALUES(appointment_end),
        estimate = VALUES(estimate),
        urgency = VALUES(urgency),
        status = VALUES(status),
        created_at = VALUES(created_at);
`;

export const insertToBufferAppointment = `
      INSERT INTO buffer_appointments 
      (patient_id, doctor_id, alcohol_consumption, smoking, height, weight,
       breathing_trouble, pain_level, pain_part, medical_concern, symptoms, temperature, estimate,appointment_date,urgency,status)  
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,?)
    `;

export const getAppointmentByPatientId = `
     SELECT 
    a.appointment_id,
    a.patient_id,
    p.account_id,
    a.medical_concern,
    CONCAT(acc.fname, ' ', acc.lname) AS doctor,
    a.status, 
    doc.specialty, 
    a.appointment_date, 
    a.appointment_start,
    a.appointment_end
    FROM 
        appointments AS a
    JOIN 
        doctors AS doc ON a.doctor_id = doc.doctor_id
    JOIN 
        patients AS p ON p.patient_id = a.patient_id
    JOIN 
        accounts AS acc ON acc.account_id = doc.account_id
    WHERE a.patient_id = ?`;
export default {
  processAppointment,
  insertToBufferAppointment,
  getAppointmentByPatientId,
};
