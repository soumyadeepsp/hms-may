import User from '../models/user.js';
import DoctorToken from '../models/doctortokens.js';
import Feedback from '../models/feedback.js';

export const addDoctors = async (req, res) => {
    const listOfDoctors = req.body.listOfDoctors;
    for (let i=0; i<listOfDoctors.length; i++) {
        const doctor = listOfDoctors[i];
        const { username, email, password, description, mobile } = doctor;
        // create a user object
        const user = new User({
            username,
            email,
            password,
            type: 'doctor',
            description,
            mobile
        });
        await user.save();
        // create a doctor token object
        const tokens = [... description.split(' '), ... username.split(' ')];
        const doctorToken = new DoctorToken({
            doctorId: user._id,
            token: tokens
        });
        await doctorToken.save();
    }
    res.status(200).json({ message: 'Doctors added successfully' });
};

export const addTokensForAllDoctors = async (req, res) => {
    const doctors = await User.find({ type: 'doctor' });
    for (let i=0; i<doctors.length; i++) {
        const doctor = doctors[i];
        const doctorTokenPresent = await DoctorToken.findOne({ doctorId: doctor._id });
        if (doctorTokenPresent) {
            continue;
        }
        const tokens = [... doctor.description.toLowerCase().split(' '), ... doctor.username.toLowerCase().split(' ')];
        const doctorToken = new DoctorToken({
            doctorId: doctor._id,
            token: tokens
        });
        await doctorToken.save();
    }
    res.status(200).json({ message: 'Tokens added successfully' });
}

export const searchDoctors = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Please provide a search term' });
    }
    const searchTokens = query.toLowerCase().split(' ');
    const tokenMatchingScores = [];
    const doctorTokens = await DoctorToken.find();
    for (let i=0; i<doctorTokens.length; i++) {
        const doctorToken = doctorTokens[i];
        const tokens = doctorToken.token;
        let score = 0;
        for (let j=0; j<searchTokens.length; j++) {
            const searchToken = searchTokens[j];
            if (tokens.includes(searchToken)) {
                score++;
            }
        }
        tokenMatchingScores.push({ doctorId: doctorToken.doctorId, score });
    }
    tokenMatchingScores.sort((a, b) => b.score - a.score);
    console.log(tokenMatchingScores);
    const doctors = [];
    for (let i=0; i<3; i++) {
        if (tokenMatchingScores[i].score!=0) {
            const doctor = await User.findById(tokenMatchingScores[i].doctorId);
            doctors.push(doctor);
        }
    }
    res.status(200).json(doctors);
}

export const acceptFeeback = async (req, res) => {
    const { doctorId, patientId, rating, comment } = req.body;
    if (!doctorId || !rating || !patientId || !comment) {
        return res.status(400).json({ error: 'Some information that are required are not present.' });
    }
    // Here you would typically save the feedback to the database
    const feedback = await new Feedback({
        doctorId,
        patientId,
        rating,
        comment
    });
    // For now, we will just log it
    await feedback.save();
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (patient.feedbackGiven) {
        patient.feedbackGiven.push(feedback._id);
    } else {
        patient.feedbackGiven = [feedback._id];
    }
    if (doctor.feedbackReceived) {
        doctor.feedbackReceived.push(feedback._id);
    } else {
        doctor.feedbackReceived = [feedback._id];
    }
    await patient.save();
    await doctor.save();

    console.log(`Feedback for doctor ${doctorId}: ${feedback}`);
    return res.status(200).json({ message: 'Feedback accepted successfully' });
}