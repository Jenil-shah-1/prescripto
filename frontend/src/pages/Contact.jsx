import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>OUR Hospital</p>
          <p className=' text-gray-500'>205,Shree Arena, Opp. Kadi Nagrik Bank ,B/h. Satyamev Hospital 
          New Chandkheda,Ahemdabad.382424  <br /> </p>
          <p className=' text-gray-500'>Tel:+91 7896426256 <br /> Email:prescripto@gmail.com</p>
         
        </div>
      </div>

    </div>
  )
}

export default Contact
