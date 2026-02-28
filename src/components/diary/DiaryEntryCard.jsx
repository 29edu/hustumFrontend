import { FaCalendarAlt } from "react-icons/fa";

const DiaryEntryCard = ({ diary, onOpen, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreview = (htmlContent) => {
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || "";
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-white/20 group">
      <div className="flex justify-between items-start mb-2">
        <h3
          className="font-semibold text-lg text-gray-800 flex-1 cursor-pointer hover:text-blue-600"
          onClick={() => onOpen(diary)}
        >
          {diary.title}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(diary)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 p-1"
            title="Edit entry"
          >
            <img
              src="/uploads/Icons/pencil.png"
              alt="Edit"
              className="w-4 h-4 object-contain"
            />
          </button>
          <button
            onClick={() => onDelete(diary._id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
            title="Delete entry"
          >
            <img
              src="/uploads/Icons/delete.png"
              alt="Delete"
              className="w-4 h-4 object-contain"
            />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-700 mb-3 flex items-center gap-1">
        <FaCalendarAlt size={12} className="text-gray-500" />
        {formatDate(diary.createdAt)}
      </p>

      <p
        className="text-gray-800 text-sm line-clamp-3 cursor-pointer"
        onClick={() => onOpen(diary)}
      >
        {getPreview(diary.content)}
      </p>

      <button
        onClick={() => onOpen(diary)}
        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Read more →
      </button>
    </div>
  );
};

export default DiaryEntryCard;
