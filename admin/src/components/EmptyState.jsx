import React from 'react'

const EmptyState = ({ 
  icon: Icon, 
  title = "No Data Available", 
  message = "There are no records to display at this moment.", 
  actionText, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-gray-150 rounded-2xl shadow-xs my-4 w-full">
      {Icon && (
        <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl mb-4 border border-gray-100">
          <Icon size={36} />
        </div>
      )}
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition shadow"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
