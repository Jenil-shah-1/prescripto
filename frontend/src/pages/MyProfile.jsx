import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {

    const [isEdit, setIsEdit] = useState(false)

    const [image, setImage] = useState(false)

    const { token, backendUrl, userData, setUserData, loadUserProfileData, medicalHistory, getMedicalHistory } = useContext(AppContext)

    // Function to update user profile data using API
    const updateUserProfileData = async () => {

        try {

            const formData = new FormData();

            formData.append('name', userData.name)
            formData.append('phone', userData.phone)
            formData.append('address', JSON.stringify(userData.address))
            formData.append('gender', userData.gender)
            formData.append('dob', userData.dob)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfileData()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const [userAppointments, setUserAppointments] = useState([])
    const loadUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            if (data.success) {
                setUserAppointments(data.appointments)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (token) {
            getMedicalHistory()
            loadUserAppointments()
        }
    }, [token])

    return userData ? (
        <div className='max-w-lg flex flex-col gap-2 text-sm pt-5'>

            {isEdit
                ? <label htmlFor='image' >
                    <div className='inline-block relative cursor-pointer'>
                        <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                        <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
                    </div>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </label>
                : <img className='w-36 rounded' src={userData.image} alt="" />
            }

            {isEdit
                ? <input className='bg-gray-50 text-3xl font-medium max-w-60' type="text" onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} value={userData.name} />
                : <p className='font-medium text-3xl text-[#262626] mt-4'>{userData.name}</p>
            }

            <hr className='bg-[#ADADAD] h-[1px] border-none' />

            <div>
                <p className='text-gray-600 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-[#363636]'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>
                    <p className='font-medium'>Phone:</p>

                    {isEdit
                        ? <input className='bg-gray-50 max-w-52' type="text" onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} value={userData.phone} />
                        : <p className='text-blue-500'>{userData.phone}</p>
                    }

                    <p className='font-medium'>Address:</p>

                    {isEdit
                        ? <p>
                            <input className='bg-gray-50' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} />
                            <br />
                            <input className='bg-gray-50' type="text" onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} /></p>
                        : <p className='text-gray-500'>{userData.address.line1} <br /> {userData.address.line2}</p>
                    }

                </div>
            </div>
            <div>
                <p className='text-[#797979] underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-gray-600'>
                    <p className='font-medium'>Gender:</p>

                    {isEdit
                        ? <select className='max-w-20 bg-gray-50' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender} >
                            <option value="Not Selected">Not Selected</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        : <p className='text-gray-500'>{userData.gender}</p>
                    }

                    <p className='font-medium'>Birthday:</p>

                    {isEdit
                        ? <input className='max-w-28 bg-gray-50' type='date' onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
                        : <p className='text-gray-500'>{userData.dob}</p>
                    }

                </div>
            </div>
            <div className='mt-10'>

                {isEdit
                    ? <button onClick={updateUserProfileData} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Save information</button>
                    : <button onClick={() => setIsEdit(true)} className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'>Edit</button>
                }

            </div>

            {/* Room Admission Section */}
            {(() => {
                const activeRoomAppt = userAppointments.find(app => app.roomRequested && (app.roomStatus === 'Allocated' || app.roomStatus === 'Pending'));
                if (activeRoomAppt) {
                    return (
                        <div className="mt-8 p-5 border border-primary/20 bg-[#EAEFFF]/20 rounded-2xl max-w-lg w-full">
                            <h3 className="font-bold text-gray-800 text-base mb-3 border-b border-primary/10 pb-2">Active Room Allocation Status</h3>
                            <div className="grid grid-cols-2 gap-y-2.5 text-xs text-gray-700">
                                <p><span className="font-semibold block text-[10px] text-gray-400 uppercase">Room Status</span> {activeRoomAppt.roomStatus}</p>
                                <p><span className="font-semibold block text-[10px] text-gray-400 uppercase">Room Category</span> {activeRoomAppt.roomCategory}</p>
                                <p><span className="font-semibold block text-[10px] text-gray-400 uppercase">Room Number</span> {activeRoomAppt.roomNumber || 'Awaiting Allocation'}</p>
                                <p><span className="font-semibold block text-[10px] text-gray-400 uppercase">Admission Date</span> {activeRoomAppt.roomAdmissionDate ? new Date(activeRoomAppt.roomAdmissionDate).toLocaleDateString() : 'N/A'}</p>
                                <p><span className="font-semibold block text-[10px] text-gray-400 uppercase">Allocated By</span> {activeRoomAppt.roomStatus === 'Allocated' ? 'Admin' : 'N/A'}</p>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Medical History Section */}
            <div className="mt-10 border-t pt-8 w-full max-w-2xl">
                <p className="text-gray-800 font-bold text-lg border-b pb-3 mb-6">Medical History & Prescriptions</p>
                {medicalHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No completed consultations found.</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        {medicalHistory.map((item, index) => {
                            const slotDateFormat = (slotDate) => {
                                if (!slotDate) return ''
                                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                const dateArray = slotDate.split('_')
                                if (dateArray.length < 3) return slotDate
                                return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
                            }

                            const handlePrintPrescription = () => {
                                const printWindow = window.open('', '_blank');
                                printWindow.document.write(`
                                    <html>
                                    <head>
                                        <title>Prescription - ${item._id}</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
                                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                                            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                                            .doctor-info { text-align: left; }
                                            .patient-info { text-align: right; }
                                            .clear { clear: both; }
                                            .section { margin-top: 30px; }
                                            .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; color: #444; }
                                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                            th { background-color: #f8f9fa; font-weight: bold; }
                                            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header">
                                            <h1 style="margin: 0; color: #2563eb; font-size: 26px;">HOSPITAL CONSULTATION PRESCRIPTION</h1>
                                            <p style="margin: 5px 0 0 0;">Date of Visit: ${slotDateFormat(item.slotDate)} | Time: ${item.slotTime}</p>
                                        </div>
                                        <div class="info-grid">
                                            <div class="doctor-info">
                                                <strong style="font-size: 14px; color: #555;">DOCTOR DETAILS</strong><br/>
                                                <span style="font-size: 16px; font-weight: bold;">${item.docData.name}</span><br/>
                                                <span>Speciality: ${item.docData.speciality}</span>
                                            </div>
                                            <div class="patient-info">
                                                <strong style="font-size: 14px; color: #555;">PATIENT DETAILS</strong><br/>
                                                <span style="font-size: 16px; font-weight: bold;">${item.userData.name}</span><br/>
                                                <span>Email: ${item.userData.email}</span>
                                            </div>
                                        </div>
                                        <div class="section">
                                            <div class="section-title">Diagnosis</div>
                                            <p style="font-size: 15px; font-weight: 500;">${item.diagnosis}</p>
                                        </div>
                                        <div class="section">
                                            <div class="section-title">Clinical Consultation Notes</div>
                                            <p style="font-style: italic; color: #555;">"${item.doctorNotes || 'No notes recorded.'}"</p>
                                        </div>
                                        <div class="section">
                                            <div class="section-title">Prescribed Medicines</div>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Medicine Name</th>
                                                        <th>Dosage</th>
                                                        <th>Directions / Advice</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${item.prescription.map(pres => `
                                                        <tr>
                                                            <td style="font-weight: bold;">${pres.medicine}</td>
                                                            <td>${pres.dosage}</td>
                                                            <td>${pres.advice || 'As directed'}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="footer">
                                            <p>This is a computer-generated prescription under role-based authorization.</p>
                                        </div>
                                        <script>
                                            window.onload = function() {
                                                window.print();
                                                window.close();
                                            }
                                        </script>
                                    </body>
                                    </html>
                                `);
                                printWindow.document.close();
                            }

                            return (
                                <div key={index} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b pb-2 border-gray-100">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">Consultation with {item.docData.name}</p>
                                            <p className="text-xs text-gray-400">{item.docData.speciality} | Hospital: {item.docData.hospital || "General Hospital"}</p>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{slotDateFormat(item.slotDate)}</p>
                                    </div>
                                    
                                    <div className="text-xs flex flex-col gap-1">
                                        <p><span className="font-bold text-gray-700">Diagnosis:</span> {item.diagnosis}</p>
                                        <p className="italic text-gray-600 mt-1">"Notes: {item.doctorNotes}"</p>
                                    </div>

                                    <div className="mt-2 border-t pt-3 border-gray-100">
                                        <p className="text-xs font-bold text-gray-700 mb-2">Prescription / Medicines:</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                                                        <th className="p-2 border">Medicine</th>
                                                        <th className="p-2 border">Dosage</th>
                                                        <th className="p-2 border">Advice</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.prescription.map((pres, i) => (
                                                        <tr key={i} className="hover:bg-gray-50/50">
                                                            <td className="p-2 border font-medium">{pres.medicine}</td>
                                                            <td className="p-2 border">{pres.dosage}</td>
                                                            <td className="p-2 border">{pres.advice || 'As directed'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handlePrintPrescription}
                                        className="mt-3 self-end text-xs font-bold text-primary border border-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-full transition-all duration-200"
                                    >
                                        Print Prescription
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    ) : null
}

export default MyProfile