// import React from "react";
// import { FileText, Trash2 } from "lucide-react";

// const DocumentList = ({ documents, onDelete, isLoading }) => {
//   return (
//     <div className="space-y-2">
//       {documents.length === 0 ? (
//         <div className="text-center py-8 text-gray-400 text-sm">
//           No documents uploaded yet
//         </div>
//       ) : (
//         documents.map((doc) => (
//           <div
//             key={doc.documentId}
//             className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
//           >
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <FileText className="w-5 h-5 text-blue-600 shrink-0" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900 truncate">
//                   {doc.filename}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {doc.chunksProcessed} chunks
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => onDelete(doc.documentId)}
//               disabled={isLoading}
//               className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-80 group-hover:opacity-100 disabled:opacity-50"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default DocumentList;

import React from "react";
import { FileText, Trash2 } from "lucide-react";

const DocumentList = ({ documents, onDelete, isLoading ,isDark}) => {
  return (
    <div className="space-y-2">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No documents uploaded in this chat
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.documentId}
            className={`${
              isDark
                ? "bg-gray-500 text-gray-950"
                : "flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            } flex items-center justify-between p-3 rounded-lg  transition-colors`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p
                  className={`${
                    isDark ? "text-gray-950" : "text-white"
                  }text-sm font-medium`}
                >
                  {doc.filename}
                </p>
                <p
                  className={`${
                    isDark ? "text-gray-950" : "text-gray-500"
                  } text-xs`}
                >
                  {doc.chunksProcessed} chunks
                </p>
              </div>
            </div>

            <button
              onClick={() => onDelete(doc.documentId)}
              disabled={isLoading}
              className={`${
                isDark ? "text-gray-950" : "text-gray-500"
              } p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DocumentList;
