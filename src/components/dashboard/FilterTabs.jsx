const FilterTabs = ({ filter, onFilterChange, counts }) => {
  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "started", label: "In Progress", count: counts.started },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="grid grid-cols-4 gap-0 px-6 py-4 bg-transparent">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
            filter === tab.id
              ? "bg-green-500/30 text-green-800 shadow-sm backdrop-blur-sm"
              : "text-gray-700 hover:bg-white/20 hover:text-gray-900"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>{tab.label}</span>
            <span
              className={`text-xs font-bold ${
                filter === tab.id ? "text-green-600" : "text-gray-400"
              }`}
            >
              {tab.count}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
