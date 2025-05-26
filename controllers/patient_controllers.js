import User from '../models/user.js';
import DoctorToken from '../models/doctortokens.js';
import Feedback from '../models/feedback.js';
import Appointment from '../models/appointment.js';

export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const patientId = req.user._id;
        console.log(req.user);

        // Check if the doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.type !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        // Check if the patient exists
        const patient = await User.findById(patientId);
        if (!patient || patient.type !== 'patient') {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        // I need to check if the doctor is available on the given date and time
        const availableSlots = doctor.availableSlots[date];
        if (!availableSlots || !availableSlots.includes(time)) {
            return res.status(400).json({ error: 'Doctor is not available at the selected time.' });
        }

        // Create a new appointment
        const appointment = await new Appointment({
            doctorId,
            patientId,
            date,
            time,
            status: 'pending'
        });
        await appointment.save();

        // store the appointment in the doctor's and patient's appointments array
        doctor.appointmentsAsDoctor.push(appointment._id);
        patient.appointmentsAsPatient.push(appointment._id);
        await doctor.save();
        await patient.save();

        res.status(201).json({ message: 'Appointment booked successfully.', appointment });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}