export const loginQuery = `SELECT 
    a.account_id, 
    a.email, 
    a.password, 
    a.fname, 
    a.lname, 
    a.age, 
    a.gender, 
    a.employed, 
    a.job_description, 
    a.contact_number, 
    a.type, 
    a.create_at AS account_create_at, 
    a.updated_at AS account_updated_at,
    -- Doctor details
    d.doctor_id,
    d.specialty,
    d.license_number,
    d.created_at AS doctor_create_at,
    d.updated_at AS doctor_updated_at,
    -- Patient details
    p.patient_id,
    p.insurance_info,
    p.created_at AS patient_create_at,
    p.updated_at AS patient_updated_at,
    -- Nurse details
    n.nurse_id,
    n.department AS nurse_specialty,
    n.license_number AS nurse_license_number,
    n.created_at AS nurse_create_at,
    n.updated_at AS nurse_updated_at
FROM 
    accounts a
LEFT JOIN 
    doctors d ON a.account_id = d.account_id
LEFT JOIN 
    patients p ON a.account_id = p.account_id
LEFT JOIN 
    nurses n ON a.account_id = n.account_id
WHERE email = ? AND password = ?`;

export default {
  loginQuery,
};
